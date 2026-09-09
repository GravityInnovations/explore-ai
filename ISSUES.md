# GitHub issues and local commit map

All implementation work is tracked in [the repository issues](https://github.com/GravityInnovations/explore-ai/issues). Commits remain local by Faik's instruction. Hashes below are plain text because unpushed commits do not resolve on GitHub.

## Delivered capabilities

- [#1 — Define ExplainAI v1 architecture and milestone delivery](https://github.com/GravityInnovations/explore-ai/issues/1)
- [#2 — Package ExplainAI and provide a safe local project installer](https://github.com/GravityInnovations/explore-ai/issues/2)
- [#3 — Define versioned design, asset, runtime and lesson contracts](https://github.com/GravityInnovations/explore-ai/issues/3)
- [#4 — Validate semantic lessons, local assets and runtime capabilities](https://github.com/GravityInnovations/explore-ai/issues/4)
- [#5 — Implement evidence-based designer workflow and profile preservation](https://github.com/GravityInnovations/explore-ai/issues/5)
- [#6 — Implement local asset discovery, reuse and provenance](https://github.com/GravityInnovations/explore-ai/issues/6)
- [#7 — Implement topic-generation workflow and specialist handoffs](https://github.com/GravityInnovations/explore-ai/issues/7)
- [#8 — Provide reusable Three.js, GSAP and React integration templates](https://github.com/GravityInnovations/explore-ai/issues/8)
- [#9 — Verify minimal examples, Codex discovery and realistic workflows](https://github.com/GravityInnovations/explore-ai/issues/9)
- [#10 — Document installation, maintenance hotspots and commit-to-issue traceability](https://github.com/GravityInnovations/explore-ai/issues/10)

## Every local milestone commit

| Milestone | Commit | Change | Issue |
| --- | --- | --- | --- |
| 1 | `6b68239` | docs: plan ExplainAI skill architecture and delivery milestones | [#1](https://github.com/GravityInnovations/explore-ai/issues/1) |
| 2 | `de3ccb9` | docs: approve implementation and track twenty local milestones | [#1](https://github.com/GravityInnovations/explore-ai/issues/1) |
| 3 | `786e23f` | feat: package the ExplainAI skill with standalone validation tooling | [#2](https://github.com/GravityInnovations/explore-ai/issues/2) |
| 4 | `6eee257` | feat: install the skill into target projects without overwriting existing files | [#2](https://github.com/GravityInnovations/explore-ai/issues/2) |
| 5 | `48a74e8` | feat: define versioned project design asset and runtime contracts | [#3](https://github.com/GravityInnovations/explore-ai/issues/3) |
| 6 | `6ae066b` | feat: define semantic lesson scenes and nineteen declarative actions | [#3](https://github.com/GravityInnovations/explore-ai/issues/3) |
| 7 | `bea49a7` | feat: generate TypeScript declarations from authoritative JSON schemas | [#3](https://github.com/GravityInnovations/explore-ai/issues/3) |
| 8 | `85ef3b0` | feat: validate strict contracts and contain project filesystem paths | [#4](https://github.com/GravityInnovations/explore-ai/issues/4) |
| 9 | `6c102c2` | feat: validate lesson semantics assets design inheritance and capabilities | [#4](https://github.com/GravityInnovations/explore-ai/issues/4) |
| 10 | `890164a` | feat: initialise project-specific design through evidence and inspection | [#5](https://github.com/GravityInnovations/explore-ai/issues/5) |
| 11 | `ca4d7a7` | feat: search and reuse project-local assets with provenance | [#6](https://github.com/GravityInnovations/explore-ai/issues/6) |
| 12 | `9bbafc5` | feat: author educational topics through semantic story planning | [#7](https://github.com/GravityInnovations/explore-ai/issues/7) |
| 13 | `0ad72b1` | docs: define specialist handoffs and independent lesson critique | [#7](https://github.com/GravityInnovations/explore-ai/issues/7) |
| 14 | `f9cbe21` | feat: provide deterministic accessible runtime integration templates | [#8](https://github.com/GravityInnovations/explore-ai/issues/8) |
| 15 | `88a7e77` | test: verify reversible runtime sampling and camera framing | [#8](https://github.com/GravityInnovations/explore-ai/issues/8) |
| 16 | `034a169` | docs: ship minimal cross-level lessons with a shared local diagram | [#9](https://github.com/GravityInnovations/explore-ai/issues/9) |
| 17 | `1da1005` | test: reject malformed projects and verify installed validation tooling | [#4](https://github.com/GravityInnovations/explore-ai/issues/4) |
| 18 | `2e577a8` | test: verify Codex discovery and realistic skill workflows | [#9](https://github.com/GravityInnovations/explore-ai/issues/9) |
| 19 | `0c02253` | fix: separate visibility from opacity in lesson validation | [#4](https://github.com/GravityInnovations/explore-ai/issues/4) |
| 20 | This documentation commit | docs: complete ExplainAI delivery documentation and issue traceability | [#10](https://github.com/GravityInnovations/explore-ai/issues/10) |

Issue #10 records the exact final documentation SHA after the commit exists. A file cannot embed its own resulting commit hash; resolve this row locally with:

```sh
git log -1 --format=%H --grep="docs: complete ExplainAI delivery documentation and issue traceability"
```

## Maintaining traceability

Use an existing issue when a change belongs to the same capability; create a focused issue for a new outcome. Put `Refs #N` in future local commit messages. Update issue scope and acceptance checks from observed results, and distinguish completed local work from remote publication. Do not rewrite existing history solely to add issue references. New work should preserve the same local-only delivery rule until Faik explicitly requests a push.
