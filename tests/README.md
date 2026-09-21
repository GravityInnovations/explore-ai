# Verification guide

Run `npm test` after installing both root and skill dependencies. Run `npm run check` for tests plus type parity, template compilation and package checks.

| Area | Evidence |
| --- | --- |
| `install.test.mjs` | Complete copying, overwrite refusal and destination containment |
| `schemas.test.mjs` | Strict Draft 2020-12 compilation |
| `structural.test.mjs` | Versions, fields, portable paths, junctions and catalog identity |
| `catalog-routes.test.mjs` | Shared Home, Catalog, level, subject and nested lesson route contract |
| `semantic.test.mjs` | Targets, hierarchy, capabilities, emphasis, contrast and ordered visibility/opacity state |
| `inspect.test.mjs` | Existing-profile discovery and byte preservation |
| `assets.test.mjs` | Indexed reuse search and missing sources |
| `e2e/fixture.spec.mjs` | Browser route, shell, lesson controls, quiz feedback and phone-gate checks |
| `runtime.test.mjs` | Deterministic sampling, reverse/jump behavior, disposal and camera bounds |
| `project.test.mjs` | Full catalog/file validation, public copies and installed CLI independence |
| `workflow-*.test.mjs` | Strict state, atomic/stale writes, transitions, QA, customer acceptance, invalidation, contained restart and one installed-CLI journey |

Workflow test fixtures explicitly simulate customer statements and observations in isolated temporary projects. They are never copied into a customer's project as real acceptance. The installed CLI journey establishes deterministic behaviour, not a real customer's satisfaction or visual QA.

`fixtures.mjs` supplies a deliberately small test-only profile and scene. The installable examples are separate explanatory fixtures. Temporary directories are created and removed by tests; they do not touch a user's existing target project. Runtime compilation uses an ignored `.tmp` directory so imports can resolve development libraries.

Use focused tests for a changed area. Run the full check when warranted rather than repeating expensive agent/browser trials without a new concern. Record independent agent and browser outcomes in the relevant [GitHub issue](https://github.com/GravityInnovations/explore-ai/issues); unit tests do not establish pedagogical accuracy, visual occlusion or assistive-technology compatibility.
