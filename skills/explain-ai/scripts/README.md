# Installed helpers

Run these with Node.js 22+ after `npm ci --ignore-scripts --no-audit --no-fund` in the installed skill directory. Always pass the user's explicit project root; never assume it is the skill directory.

| Entry point | Usage |
| --- | --- |
| `inspect.mjs` | `<project-root>`: read-only framework/path/profile inspection and fingerprint |
| `find-assets.mjs` | `<project-root> [terms]`: search the local index and verify matching files |
| `validate.mjs` | `--project <root> [--lesson <relative-path>] [--integrated]`: validate a catalog/package |
| `validate.mjs` | `--kind <contract> --file <json>`: standalone structural check; design also checks body contrast |

Internal modules: `contracts.mjs` loads bundled Ajv schemas; `paths.mjs` handles portable relative paths, junction containment and collision-free identity. `validate.mjs` adds semantic and filesystem rules. These scripts are read-only and do not call a model, download assets or upload content.

Hotspots when extending validation:

- Keep visibility and material opacity separate; actions are ordered setters against each step's baseline.
- Check new secondary targets and geometry prerequisites when adding actions.
- Use safe root resolution for every new filesystem reference.
- Preserve explicit errors and nonzero exits; never silently drop unknown fields or unsupported actions.
- A capability manifest is a declaration. Actual handlers/anatomy and browser behavior need separate evidence.

See [VALIDATION.md](../references/VALIDATION.md) for the complete contract and command boundaries. Production lesson requests should not spawn this CLI on every request; validate during authoring/build and load reviewed content through a bounded runtime adapter.
