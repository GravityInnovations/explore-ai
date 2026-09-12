# Authoritative data contracts

All contracts use JSON Schema Draft 2020-12. The package validator resolves references locally; `$id` URLs identify schemas and are not fetched at runtime.

| File | Owns |
| --- | --- |
| `common.schema.json` | Version, catalog keys, semantic paths, relative paths, vectors, colours, source records and action/camera vocabularies |
| `project.schema.json` | Explicit project-local output and runtime paths |
| `catalog.schema.json` | Deterministic additive level → subject → lesson entries and nested routes |
| `design.schema.json` | Project-specific design values and their evidence |
| `workflow.schema.json` | Guided designer decisions, stages, QA evidence and revision-bound acceptance |
| `asset-index.schema.json` | Shared and lesson-local asset metadata shape |
| `runtime.schema.json` | Declared global and per-component capabilities |
| `lesson.schema.json` | Identity, metadata, semantic tree, story steps and discriminated actions |

Change JSON here first, then run `npm run types:generate` from the development repository and validate affected examples/tests. Keep action variants, the common vocabulary and [LESSON-SPEC.md](../references/LESSON-SPEC.md) aligned. Unknown fields/versions fail; introduce an explicit migration when semantics change.

## Compatibility

Data contracts are the project, design, asset-index, runtime and lesson documents. Workflow state is an operational record with its own version and lifecycle.

| Skill package | Data contracts | Workflow state |
| --- | --- | --- |
| `0.2.0` | `2.0.0` | `1.0.0` |

The package version and contract versions are independent. The v2 transition changes the explicit data-contract boundary; migrate v1 project data with `node scripts/migrate.mjs --project <root>` to inspect the plan, then repeat with `--write`. The workflow file is not rewritten. Its stored design fingerprint becomes stale after the design profile changes, so the customer must review and accept the migrated preview again.

The v1-to-v2 migration assigns a missing design colour-strategy default to `theme`; it never infers colors from CSS or rewrites object materials. A lesson may explicitly override that accepted default with `imitated` or `theme`.

Schema validity cannot establish referential integrity, path containment or rendered behavior. Those checks belong to the semantic/filesystem validator and actual runtime review. Do not loosen schemas to silence an unsupported runtime action.
