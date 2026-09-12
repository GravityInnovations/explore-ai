# Lesson format v2

The JSON schemas in `schemas/` are authoritative. They use Draft 2020-12, require exact data-contract `schemaVersion: "2.0.0"`, and reject unknown fields. Generated TypeScript in `types/` mirrors structure; semantic checks remain necessary. The separate workflow contract remains at v1 and tracks designer review and acceptance. Schema IDs are identifiers, not required network downloads: the validator loads bundled schemas locally.

## Identity, content and scene

`lessonId` equals `level/subject/topicKey`. All three keys are lowercase hyphenated catalog segments. `slug` is a separate route key. The topic folder uses `topicKey`; the route uses `slug`. This avoids ambiguous hyphen concatenation and allows the same topic at multiple levels. Reject route collisions within one level/subject.

`metadata` supplies summary, objectives, an explicit `contentKind` (`factual` or `illustrative`) and source records (`id`, `title`, `reference`, optional `note`); a source may be a local document or verified URL. Factual steps require `sourceRefs` that point to those stable source IDs. `simplificationNote` records intentional level-appropriate wording without copying source prose into learner-facing text. Illustrative fixtures must be marked `illustrative`; production factual lessons require reviewed evidence and traceable step references.

`quiz` is a local declarative question pool. Enabled quizzes draw 3–10 questions, require at least one question for every objective, and give each question exactly one correct answer with an explanation. `objective-1`, `objective-2` and later IDs refer to the ordered metadata objectives. Selection uses a caller-provided seed so tests remain deterministic; it never introduces a concept absent from the lesson objectives.

`objects` is a flat array representing a semantic tree. Each object has `id`, `component`, `label` and `description`. An ID such as `cell.nucleus` requires `parent: "cell"` and a separately declared parent. Root objects omit parent. Optional `assetId`, `material`, `position` and uniform `scale` customise reusable components. Material names resolve to the design profile. Vectors use `{x,y,z}`; no raw mesh names or executable expressions.

`steps` is ordered. Each has `id`, `title`, `text`, `explains`, `actions`, `camera` and `alt`. `explains` lists every specific visible object/part discussed in the prose. Each target must be emphasised directly or framed by a non-wide camera. The critic checks whether these declarations actually match the wording and rendered view. Optional `scrollUnits` overrides inherited pacing; optional `narrationAssetId` points to local audio.

Lesson `assets` contains only lesson-specific metadata. Shared assets resolve from the library index. `accessibility.summary` provides the required textual fallback; `staticDiagramAssetId` optionally references an explicitly requested image. Every step's `alt` describes the teaching content, not merely "3D image".

Educational object colour strategy resolves as lesson `metadata.colorStrategy` first, then the accepted design `lessonColorStrategyDefault`. `imitated` permits recognizable subject colours; `theme` uses the accepted project materials. The strategy does not change UI chrome, typography or navigation, and object JSON cannot add arbitrary colour overrides.

## Action semantics

Every action requires `action` and `target`. Fields below are additional required parameters unless marked optional. All numeric distances use the scene's documented world units, angles use degrees (convert once for Three.js), and opacity ranges from 0 to 1. A transform without any transform field is invalid.

| Action | Parameters | Required effect / geometry |
| --- | --- | --- |
| focus | none | Visually prioritise the target through framing/composition |
| highlight | none | Apply the inherited emphasis treatment, with a non-colour cue |
| isolate | none | Retain the target/subtree and contextual ancestors; hide other objects |
| extract | offset vector | Separate the target from its baseline position while preserving context |
| explode | distance > 0 | Separate semantic child parts using defined outward directions |
| dissect | parts array | Expose the named descendant parts; suitable separable anatomy required |
| assemble | none | Return target and its subtree to baseline assembly |
| orbit | degrees | Inspect the target by orbiting the camera around its bounds |
| inspect | none | Present an unobstructed useful view of the target |
| reveal | none | Set target/subtree visibility on, respecting ancestor visibility; opacity is unchanged |
| hide | none | Hide target and descendants |
| fade | opacity | Set target/subtree opacity without losing material ownership |
| xray | opacity | Make target's outer surfaces transparent to expose interior anatomy |
| cutaway | normal vector, constant | Clip by the plane normal·point + constant = 0; nonzero normal required |
| magnify | factor > 0 | Enlarge the target's presentation while communicating context/scale |
| follow | path of target IDs | Track the named semantic waypoints in order |
| compare | with target ID | Show both distinct targets in a clearly readable comparison |
| flow | to target ID | Show direction/process between distinct endpoints |
| transform | optional position/rotation vectors, scale > 0 | Set specified values relative to baseline conventions; no arbitrary code |

No action is silently mapped to a vaguely similar effect. Capability manifests list implemented action names and camera modes plus per-component supported actions. Handler code and geometry must substantiate those declarations. Advanced imported anatomy may need an adapter; opaque model nodes alone are insufficient.

For teaching emphasis, choose the implemented action that makes the intended relationship clearest: focus/highlight for identification, xray or an adapter-backed cutaway for interiors, extract/explode for separation, magnify for detail, and compare/flow for relationships. A highlight remains valid when it is clearest; repeated highlight-only steps are a critic warning when another registered capability fits.

Keep story-step copy progressive: one teaching point, a short heading and no more than two short blocks. The general density critic warns above 65 words or three prose sentences without changing the authored text; grade bands may add stricter guidance.

## Camera, state and defaults

Camera requires a semantic `target` and `mode`: wide, medium, close, macro, inside, orbit, top, side or best. Optional `position` and `lookAt` override derived placement. Calculate framing from bounds, aspect ratio, field of view, surrounding occlusion and the current project scene scale. Exact coordinates are escape hatches, not default authoring practice.

Each step starts from the immutable canonical baseline. Actions are evaluated in order and sampled by absolute progress; repeated calls cannot accumulate transforms. Scrubbing backward or jumping to a step must produce the same state as arriving there normally. `assemble` restores baseline geometry, not a snapshot from the previous step. Camera/action conflicts must be resolved in the adapter and reviewed visually.

Visibility and material opacity are independent. A later positive `fade` restores opacity; `reveal` does not. `fade` sets opacity throughout the semantic subtree. `xray` sets only the target's outer-surface opacity so internal descendants can remain visible. `assemble` restores owned baseline geometry, visibility and opacity for its subtree; hidden ancestors still apply. Validators check these declared endpoint states, while intermediate occlusion and legibility need rendered review.

Default appearance, duration, easing and scroll pacing come from the design. Objects select material names, not duplicated colour/material settings. The runtime owns rendering and animation; JSON never contains script strings, callback names, imports or general conditional logic.

## Extension and compatibility

To add an action: specify semantics and parameters, update common vocabulary and lesson action variant, regenerate TypeScript, implement and test the runtime handler/component support, then extend validation and examples. Add an explicit migration when changing existing meaning. Unsupported versions/actions fail clearly; no silent downgrade. See the schema [compatibility table](../schemas/README.md) and use the bundled migration for v1 data. A future storage adapter may change persistence while preserving these contracts.
