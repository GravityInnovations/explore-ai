# Authoritative data contracts

All contracts use JSON Schema Draft 2020-12. The package validator resolves references locally; `$id` URLs identify schemas and are not fetched at runtime.

| File | Owns |
| --- | --- |
| `common.schema.json` | Version, catalog keys, semantic paths, relative paths, vectors, colours, source records and action/camera vocabularies |
| `project.schema.json` | Explicit project-local output and runtime paths |
| `design.schema.json` | Project-specific design values and their evidence |
| `asset-index.schema.json` | Shared and lesson-local asset metadata shape |
| `runtime.schema.json` | Declared global and per-component capabilities |
| `lesson.schema.json` | Identity, metadata, semantic tree, story steps and discriminated actions |

Change JSON here first, then run `npm run types:generate` from the development repository and validate affected examples/tests. Keep action variants, the common vocabulary and [LESSON-SPEC.md](../references/LESSON-SPEC.md) aligned. Unknown fields/versions fail; introduce an explicit migration when semantics change.

Schema validity cannot establish referential integrity, path containment or rendered behavior. Those checks belong to the semantic/filesystem validator and actual runtime review. Do not loosen schemas to silence an unsupported runtime action.
