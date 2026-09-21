# Installed helpers

Run these with Node.js 22+ after `npm ci --ignore-scripts --no-audit --no-fund` in the installed skill directory. Always pass the user's explicit project root; never assume it is the skill directory.

| Entry point | Usage |
| --- | --- |
| `inspect.mjs` | `<project-root>`: read-only framework/path/profile inspection and fingerprint |
| `workflow.mjs` | `<command> --project <root> [--input <relative.json>] [--expect <revision>] [--json]`: guided designer state, review and topic preflight |
| `migrate.mjs` | `--project <root> [--write]`: plan or apply the supported v1-to-v2 data-contract migration |
| `build-catalog.mjs` | `--project <root> [--write]`: deterministically plan or write the configured level → subject → lesson catalog |
| `find-assets.mjs` | `<project-root> [terms]`: search the local index and verify matching files |
| `pedagogy.mjs` | Deterministic grade-band cognitive-load and sequence critic |
| `quiz.mjs` | Seeded objective-covering question and answer selection |
| `validate.mjs` | `--project <root> [--lesson <relative-path>] [--integrated]`: validate a catalog/package |
| `validate.mjs` | `--kind <contract> --file <json>`: standalone structural check; design also checks body contrast |

Internal modules: `contracts.mjs` loads bundled Ajv schemas; `paths.mjs` handles portable relative paths and containment. `validate.mjs` adds semantic/filesystem rules. `workflow-actions.mjs` owns transitions and guidance; `workflow-store.mjs` owns strict reads, atomic locked writes, archive/reset and scoped fingerprints. Inspection, validation and search remain read-only. Workflow commands and an explicitly confirmed migration may write project state. No helper calls a model, downloads assets or uploads content.

Migration is dry-run by default and prints every owned contract it would update. `--write` first stores exact source bytes under `.explore-ai/migrations/1.0.0-to-2.0.0/backup/`, refuses conflicting backups, replaces each contract atomically and validates the result. It changes only configured ExplainAI JSON contracts. It preserves other project files and the v1 workflow record; design acceptance must be renewed after migration.

See [WORKFLOW.md](../references/WORKFLOW.md) for payloads and evidence. Preserve the distinction between structural validity, QA observations and customer acceptance. Preview source changes invalidate downstream reviews. Draft catalog validation does not grant permission to author topics; `preflight`, selected-lesson and integrated checks enforce current acceptance.

Hotspots when extending validation:

- Keep visibility and material opacity separate; actions are ordered setters against each step's baseline.
- Check new secondary targets and geometry prerequisites when adding actions.
- Use safe root resolution for every new filesystem reference.
- Preserve explicit errors and nonzero exits; never silently drop unknown fields or unsupported actions.
- A capability manifest is a declaration. Actual handlers/anatomy and browser behavior need separate evidence.

See [VALIDATION.md](../references/VALIDATION.md) for the complete contract and command boundaries. Production lesson requests should not spawn this CLI on every request; validate during authoring/build and load reviewed content through a bounded runtime adapter.
