# Designer workflow

Create a reusable visual language inside the target project, using its existing implementation and supplied references as evidence. This workflow writes design/configuration, not production lessons. The user can explicitly request design revisions later.

## Inspect before interviewing

Run `node <installed-skill>/scripts/inspect.mjs <project-root>` and inspect relevant project instructions, `package.json`, App Router layouts, global CSS/tokens, fonts, reusable 3D components and user references. The inspector is read-only; it returns profile status and a SHA-256 fingerprint. Do not scan vendor or build directories.

- `ready`: reuse the profile. Report its path and ID. Do not write it again unless the user requested an update.
- `unconfigured`: a valid default-location profile exists. Adopt its path in the configuration and preserve its bytes.
- `invalid`: show the specific failure and repair within the user's design intent; do not replace it wholesale with an example.
- `missing`: search the project's established design locations and supplied references before starting an interview.

If the user already provided sufficient preferences, proceed. Otherwise ask the single highest-impact unresolved question, such as intended audience or an unresolved reference conflict. Do not mechanically ask about every schema field. Derive subordinate details consistently and identify assumptions in evidence.

## Reference interpretation

Inspect screenshots/images visually; inspect supplied CSS/tokens and actual webpage references using available tools. Record which choices are directly observed, inferred or explicitly chosen. Do not claim exact font families from an image alone. If an input cannot be read, state that limitation and ask only for information needed to proceed.

Preserve established typography, palette, spacing and accessible controls unless a redesign is requested. Translate reference characteristics into materials, lighting, shape treatment, camera expressiveness and motion. A flat image does not establish 3D lighting settings: treat those as inferences. Resolve conflicts using explicit user choices first, existing project constraints next, then reference evidence. Label significant approximations.

## Author the profile

Read `schemas/design.schema.json` for the exact shape. Author one `design/profile.json` (or configured equivalent):

- `schemaVersion: "1.0.0"`, a stable project design `id`, audience and concise `evidence` records.
- Typography families/base size/line height, spacing and four semantic colours.
- Named material presets with colour, roughness, metalness and opacity.
- Lighting, shadows, shape/edge treatment and realism.
- Motion duration/easing/ambient preference/scroll units; camera intent and expressiveness.
- Highlight treatment, label style, mobile priority/pixel-ratio budget and accessibility alternatives.

Use hex RGB colours for v1; resolve project CSS colour variables to values while keeping the original token mapping in evidence. Do not inject an example theme. If existing colours fail the profile's minimum text contrast, make the smallest evidence-consistent accessibility adjustment and explain it. Visual checks are still required for labels over geometry.

Create `explain-ai.config.json` from `schemas/project.schema.json`, adapting the default paths below to the project:

```json
{
  "schemaVersion": "1.0.0",
  "paths": {
    "design": "design/profile.json",
    "content": "content",
    "assetLibrary": "asset-library",
    "publicAssets": "public/explain-ai",
    "runtime": "explain-ai.runtime.json"
  }
}
```

Create an empty versioned asset index only when none exists. Runtime capabilities must reflect implemented handlers/components; if no runtime exists, leave integration for the topic workflow rather than inventing capabilities. Designer does not need a completed runtime to validate its output.

## Validate and finish

Run `validate.mjs --kind project --file <config>` and `validate.mjs --kind design --file <profile>`. Re-run inspection. Review the profile against its source evidence, especially audience, typography, material language and motion preferences. If reusing a profile, verify its fingerprint did not change. Report the profile/config paths, major inferred choices and validation outcome. Future lessons inherit this profile; they may select existing material presets but do not redefine global design.
