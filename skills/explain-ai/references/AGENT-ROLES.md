# Specialist stages and handoffs

Use these responsibilities to separate decisions, even when one agent executes them sequentially. Delegate bounded independent work only when the host supports it and the user's instructions authorise it. A fleet is optional; no remote orchestration framework or paid API is required.

Share a compact project context: target root/config paths, level/subject/topic, design ID/fingerprint, relevant sources, runtime capabilities and the current artifact paths. Load only relevant role instructions. Do not send every agent the entire repository or repeat the design interview. Each specialist returns decisions, evidence, artifacts and unresolved issues, not a rewritten global plan.

| Role | Inputs | Output and acceptance |
| --- | --- | --- |
| Education Planner | Topic, level interpretation, curriculum/reference evidence | A short objective/sequence outline, intentional simplifications and source-backed claims; flag unresolved factual questions |
| Visual Director | Objectives and design profile | Concept-to-target teaching choices from the intent table, useful spatial composition, variety justified by understanding, and fallback strategy |
| Asset Planner | Visual requirements, local library and component registry | Reuse matches, procedural/new-asset decisions, provenance, anatomy requirements and missing runtime capabilities |
| Scene Composer | Agreed visuals/assets | A semantic object hierarchy, reusable component bindings and stable names; no missing parents or opaque mesh references |
| Choreography Agent | Scene and sequence | Complete independent story steps, explicit action parameters, semantic camera intent, clear emphasis and reversible progress |
| Content Writer | Objectives, sources and visible scene targets | Concise level-appropriate copy, exact `explains` references, meaningful alt text and conclusion; no unshown anatomical claims |
| Validator / Critic | Original brief, generated package and observed runtime | Structural results plus factual, instructional, visual, accessibility and inheritance findings with specific evidence |
| Optimizer | Validated package and reusable defaults | Smaller authoring footprint through default/component/asset reuse; preserve meaning and emphasis and rerun validation |

## Dependency order

Education planning precedes visual direction. Asset planning and focused factual source work may proceed independently once scope is fixed. Scene composition precedes final choreography. Writing and choreography can draft in parallel against agreed scene targets, but the coordinator reconciles every `explains` entry with the actual prose. Critique follows a coherent package; optimisation follows critique and triggers revalidation.

One coordinator owns final writes to shared lesson/design/index files. Separate owned output paths when running agents concurrently. Do not let subagents overwrite one another's JSON or edit the design during topic generation. Escalate only the unresolved issue that materially changes educational accuracy, architecture or the user's intent.

## Critic checklist

1. Can the chosen learner understand the sequence and its conclusion? Are sources and simplifications honest?
2. Does every named part in the text have a real semantic target, visible in that exact step? Inspect actual render/occlusion; a valid ID is insufficient.
3. Does each advanced action have an implemented handler and appropriate anatomy? Are comparisons simultaneously legible?
4. Do consecutive steps vary emphasis when another registered technique fits, while retaining justified highlights?
5. Are assets local, appropriately attributed and reused? Are browser URLs valid?
6. Is the design fingerprint unchanged unless a design revision was explicitly requested?
7. Do reverse scroll, resize, keyboard navigation, reduced motion and no-WebGL content work? Do labels rely on more than colour?
8. Did optimisation remove duplication without deleting necessary explanation or focus?

## Independent skill forward-test

When maintaining this skill, give an independent agent only the installed skill, a realistic user request and raw reference/project files in an isolated scratch project. Do not supply the expected answer or suspected defect. Inspect the resulting artifacts and actual tool outcomes. Keep deterministic validation tests separate from agent behavior and rendered evidence. Fix demonstrated problems, then rerun affected scenarios. If a host capability is unavailable, document the limitation rather than substituting a wording check for a behavioral pass.
