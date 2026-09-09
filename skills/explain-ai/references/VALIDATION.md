# Validate generated output

Requires Node.js 22+ and the installed skill's dependencies. From that skill folder run `npm ci --ignore-scripts --no-audit --no-fund` once. All following script paths are relative to the installed skill folder; the project argument is an absolute path to the user's project. These scripts do not mutate project files.

```sh
node scripts/validate.mjs --kind design --file /absolute/project/design/profile.json
node scripts/validate.mjs --project /absolute/project
node scripts/validate.mjs --project /absolute/project --lesson content/k5/science/plant-cell/lesson.json
node scripts/validate.mjs --project /absolute/project --integrated
```

On Windows quote paths containing spaces and use `npm.cmd` in PowerShell. Output is JSON `{valid, errors}` with paths and reasons. Any failure exits nonzero. Unknown contract versions, fields and actions are errors, not silently dropped. Standalone `--kind` checks structure only except design, which also checks body text/background contrast. Full project validation adds semantic, asset and runtime checks. Validate the entire catalog before delivery: checking only one lesson cannot detect another lesson's route collision.

The project needs its configuration, design, asset index (even when empty), runtime capability manifest and lesson files. See the schemas for exact shapes. Draft manifests may list no actions/components, but lesson validation will then correctly report unsupported work. Never claim integration from adding names to that manifest alone.

`--integrated` additionally verifies every non-component asset has a byte-identical browser copy under the configured public-assets root:

- Library: `<publicAssets>/library/<asset.path>`.
- Lesson: `<publicAssets>/lessons/<lessonId>/<asset.path>`.

This is the v1 copy convention. If the project uses an existing asset server, implement and test an explicit adapter before changing validation; do not call a failed copy check a pass. Component source is bundled through reviewed TypeScript imports, never served as a public file. Non-asset procedural scenes have no copies to verify.

Automated checks cover contracts, identity, target existence, hierarchy, declared focus, basic visibility contradictions, materials, capability declarations, references, type compatibility for narration/diagrams, file existence, root containment and public copies. Text/background contrast does not establish contrast on every 3D surface.

The critic must separately review factual sources, level appropriateness, actual copy-to-target alignment, occlusion, labels, unsupported geometry, mobile composition, keyboard access, backward scroll, reduced motion and no-WebGL output. A manifest is a declaration, not evidence of a working renderer. Report structural checks, agent exercises and browser observations separately.
