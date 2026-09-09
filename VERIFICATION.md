# ExplainAI v1 verification

Recorded 2026-09-09. This report distinguishes package validation, agent exercises and observed rendering.

## Actual Codex discovery

Codex CLI 0.153.4 was queried through its local app-server `skills/list` API after copying the package into an isolated target project's `.agents/skills/explain-ai`. The response identified exactly that `SKILL.md`, with name `explain-ai`, scope `repo` and `enabled: true`. No model turn was used for this discovery query. Reproduce with `node scripts/check-discovery.mjs <installed-target-project>`.

The bundled skill-creator `quick_validate.py` also returned `Skill is valid!`. Its PyYAML dependency was installed only in disposable scratch storage because neither available Python runtime already provided it.

## Independent designer exercises

An independent agent received only the installed skill and raw scenario inputs in separate scratch projects:

- New adult mechanical-learning project: created a project-specific light, restrained technical profile from explicit preferences, configuration and an empty local index. Installed project/design/index validators passed and inspection returned `ready`.
- Teenage-learning CSS reference: preserved its actual dark palette, Georgia headings, Arial body, font size, line height and spacing; documented 3D choices as inferences. Installed validators passed.
- Repeat designer on that reference project: reused the existing profile without rewriting it. SHA-256 remained `871d6bf5ba3d7dd93c777de49273cb75af44918587be4a43c9e18e9c3f26a481`.

The coordinator inspected the generated profiles, reports and fingerprint. No runtime was invented for these design-only scenarios, so rendered design quality was not claimed from their JSON checks.

## Topic and runtime trial

A separate independent agent used the installed skill to author k1 and k2 maths lessons about equal parts in a new temporary Next.js App Router project. It reused one original local SVG and a procedural Three.js rectangle, preserved the existing design, implemented semantic highlight handlers and GSAP scroll integration, and created catalog/lesson routes.

The agent reached a host usage limit before completing verification. The coordinator completed the TypeScript check, production build and browser checks locally; this was not a fully independent end-to-end verdict.

- Existing design SHA-256 stayed `dc9a29f62c57daf2bdadd0da62a13a440c2684554523ab0b559930e9281d227a`.
- The generated Next.js 16.3.4 project passed TypeScript and production compilation. Dynamic filesystem loading caused four build tracing warnings. RUNTIME.md now directs agents to validate at authoring/build time and use explicit catalog imports or narrowly scoped/cached server loading. The scratch app was not hardened for production deployment; no warning-free production build is claimed.
- Desktop browser: the whole rectangle and the explained half rendered; the other half dimmed while context remained visible. Keyboard activation of the "One half" anchor focused its section and selected the expected semantic targets.
- Reverse scrolling changed the active scene step. At 390 × 844, the equal-parts scene, labels and explanation remained readable.
- The scratch app's explicit no-WebGL test path rendered the local diagram and all lesson text without a canvas. No browser console errors were captured in the inspected tab.

The temporary app was an acceptance artifact, not a shipped theme or production site. Reduced-motion endpoints and cleanup are covered by controller tests; actual OS-level media-query changes were not visually exercised. No exhaustive device, assistive-technology, advanced-anatomy or production deployment claim is made.

## Independent validator findings

A bounded independent trial exercised six malformed packages plus a baseline. Invalid references, incompatible diagram types, same-target comparison, hidden ancestors and missing assets rejected correctly. It found a real opacity/visibility conflation: a later positive fade remained marked hidden. A related reveal sequence exposed ambiguous opacity restoration semantics.

Regression coverage now distinguishes visibility and opacity, positive fade restoration, xray outer surfaces and assembly reset. The actual reproduction with restored opacity passes; revealing a zero-opacity target rejects. See the implementation-fix commit and regression tests for the durable evidence.

## Reproducible automated checks

Run the documented development setup and `npm run check`. It verifies generated type parity, strict template compilation, structural/semantic/filesystem behavior, installed CLI independence, package links, action-vocabulary documentation and matching MIT licenses. Test cases use disposable directories and do not modify the original license or remote repository.

Final `npm run check`: **43 tests passed, zero failures**, generated types matched schemas, all runtime templates typechecked, and package checks passed for 47 installed files and 19 documented actions. The final documentation pass exposed a schema loader assuming every directory entry was JSON; the loader and compilation test now explicitly select `*.schema.json`, and the complete check passed afterwards.

The disposable acceptance projects, dependency experiments, protocol output and local browser/server were removed or stopped. The repository retains only minimal intentional fixtures and normal ignored development dependencies. The original build prompt and MIT license are unchanged. GitHub issues track the work through ISSUES.md; implementation commits remain local and no deployment or push was performed.
