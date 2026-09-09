# ExplainAI v1 implementation plan

Status: proposed, awaiting Faik's verification before implementation.

## Outcome and scope

Build a self-contained, MIT-licensed `explain-ai` agent skill. A user's Codex agent installs it into a Next.js project, establishes that project's design language, then creates and integrates declarative educational lesson packages. The skill repository ships instructions, contracts, executable validation, small reusable integration templates, and minimal test examples. It does not ship a production website, fixed theme, lesson catalog, backend, or large asset collection.

The initial checkout contains only the original build prompt and MIT license. It was cloned from `https://github.com/GravityInnovations/explore-ai.git`; the initial local and remote `main` both resolve to `eeec0cfe7c46b511b288ae54a025b96d414fca6d`.

## 1. Repository and installable structure

```text
LICENSE
ExplainAI_Skill_Astra_Prompt.md
IMPLEMENTATION-PLAN.md
README.md
INSTALL.md
AGENTS.md                         repository maintenance guidance
TASKS.md                          created after plan approval
package.json                      development and verification commands
package-lock.json
scripts/                          local installation and repository checks
tests/                            automated contracts and behavioral scenarios
skills/explain-ai/
  SKILL.md                        short entrypoint, name/description, routing
  agents/openai.yaml              discovery and invocation metadata
  LICENSE                        MIT license accompanies installed package
  package.json                    standalone validator dependencies/commands
  package-lock.json
  references/
    DESIGNER.md
    EXPLORE-A-TOPIC.md
    LESSON-SPEC.md                 schema semantics and action vocabulary
    ASSETS.md
    AGENT-ROLES.md
    RUNTIME.md
    VALIDATION.md
    EXAMPLES.md
  schemas/                        project config, design, lesson, asset index
  types/                          generated TypeScript contract declarations
  scripts/                        validator, project inspection, asset lookup
  assets/templates/               neutral runtime integration building blocks
  examples/                       minimal illustrative JSON and local assets
```

Everything required after installation lives inside `skills/explain-ai`. Development tests and maintainer documentation stay outside it. No duplicated root `SKILL.md`, competing schema copies, or references back to the original checkout.

## 2. Commands and discovery

Expose two workflow modes through one skill:

```text
$explain-ai designer
$explain-ai explore-a-topic
Level: k5
Subject: science
Topic: plant cell
```

`designer` and `explore-a-topic` are workflow instructions, not invented executable or slash commands. Natural-language activation remains enabled. Once the skill is selected, short workflow names are sufficient in context.

Recommend installing from this local checkout into `<target-project>/.agents/skills/explain-ai` for the initial trial, since implementation commits will remain local. Supply a cross-platform Node copy helper that checks the destination and refuses to overwrite an existing installation silently. Also document copying the folder directly and using Codex's bundled skill-installer with the repository URL/path once those files exist remotely. Do not claim the GitHub installer can retrieve unpushed work.

Verify actual discovery through the available Codex interface in an isolated project. File presence and valid frontmatter alone are not proof of discovery. Current official documentation supports repo-scoped `.agents/skills` and standalone skills; its preferred broader distribution mechanism is plugins. A marketplace/plugin wrapper is a future packaging option rather than a prerequisite for this local first version. Source: [OpenAI Build skills](https://learn.chatgpt.com/docs/build-skills), inspected 2026-09-09. The environment's bundled skill-installer also supports installation from a GitHub repository subdirectory.

## 3. Target-project files and design initialization

Default output locations:

```text
explain-ai.config.json
design/profile.json
asset-library/index.json
asset-library/<category>/<asset files>
content/<level>/<subject>/<topic>/lesson.json
content/<level>/<subject>/<topic>/assets/<topic-specific files>
```

The small config records project-relative design, content, asset, and runtime integration locations. Inspect existing App Router, TypeScript, styling, assets, and Three.js/GSAP usage before choosing paths; adapt to established conventions. Never write outside the target project through traversal or symlink escapes.

Keep one versioned design profile in v1. Include typography, spacing, colour, materials, lighting, shape treatment, motion, camera, highlighting, labels, scroll pacing, mobile and accessibility preferences. It is authored from target-project evidence and user choices. Shipped examples are explanatory fixtures, never an automatically applied theme.

For an existing profile, validate and reuse it; make requested changes explicitly. For references, inspect the supplied screenshot/site/CSS/tokens and distinguish observed choices from inferred ones. With no reference, ask one high-value question at a time, only until meaningful decisions are resolved. Record design rationale and evidence compactly. The topic workflow routes through designer only when a usable profile is missing; it does not independently change global styling.

## 4. Topic-generation workflow

1. Inspect project configuration, design and runtime capabilities; collect missing level, subject or topic only.
2. Establish age/level-appropriate learning objectives, scope, factual sources, misconceptions and narrative sequence. Treat level codes as user/project taxonomy, not universally equivalent curricula.
3. Plan the visual teaching technique for each concept, including what must remain visible and what needs focus, isolation, dissection or comparison.
4. Search local assets/components, select reuse versus procedural geometry versus new assets, and record provenance/licensing.
5. Compose semantic scene objects and hierarchy with readable paths such as `cell.nucleus`.
6. Write concise story steps, explicit referenced targets, camera intent, visual actions and accessibility alternatives.
7. Generate JSON, validate it, repair failures and integrate it into the target runtime and catalog conventions.
8. Preview representative steps on desktop/mobile, reduced motion and no-WebGL fallback; report observed results and any unverified behavior.

Identity is the `(level, subject, topicKey)` tuple, with a deterministic unambiguous lesson ID and filesystem path. Keep `slug` as a separate route-facing field. Do not rely on naive hyphen concatenation alone to guarantee uniqueness. Repeated topics at different levels must coexist. Updating an existing lesson preserves user-authored assets and content outside the requested scope.

## 5. Schema and type strategy

Use JSON Schema Draft 2020-12 as the authoritative structural contract, validated by Ajv in strict mode. Generate TypeScript declarations from the schemas and check for drift. Keep validation dependencies and lockfile within the installed skill so validation works without the development checkout. Verify exact dependency versions during implementation.

Version the design, lesson, configuration and asset-index formats explicitly. Reject unknown major versions and unsupported properties rather than guessing. Use discriminated action variants with per-action parameters; do not accept arbitrary code, expressions or unlimited extension blobs.

Lesson structure includes identity/metadata, learning objectives and source notes, semantic objects and parent relationships, asset IDs, ordered story steps, camera intent, focus/highlight intent, optional numerical overrides, accessibility and optional local narration hooks. Steps explicitly list the objects the text explains so validation can check visual emphasis against declared references; a critic still reviews the actual prose.

Define all initial requested actions: focus, highlight, isolate, extract, explode, dissect, assemble, orbit, inspect, reveal, hide, fade, xray, cutaway, magnify, follow, compare, flow and transform. Define their inputs, semantic effects, reset behavior and capability requirements. Camera intents include wide, medium, close, macro, inside, orbit, top, side and best. New actions require schema, documentation, runtime-handler and test updates.

## 6. Runtime integration contract

The target runtime owns scene construction, semantic object lookup, bounds-based camera framing, action execution, design inheritance, local asset resolution and scroll progress. Provide compact adaptable TypeScript templates and a capability contract, not a complete Next.js app or general animation engine.

Use a client boundary for Three.js/GSAP, with server-side filesystem loading where appropriate. Specify deterministic step state, backward scrolling, cleanup of GSAP contexts/listeners and GPU resources, responsive camera behavior and reduced-motion/static alternatives. Distinguish filesystem asset paths from browser URLs: a `content/` file is not automatically public. Document safe copying/mapping into the project's public assets or an existing local-serving mechanism.

Advanced actions require suitable geometry and handlers: a cutaway is not satisfied by labelling a generic fade as a cutaway. The validator/integration check rejects actions or scene components unsupported by the target runtime. The agent implements the required handler or selects an educationally honest supported alternative before claiming the lesson works.

## 7. Local asset library

Use one small JSON index with stable asset IDs, type, relative path, tags, description, provenance, license and relevant semantic anatomy/component metadata. Search the index before generating duplicates; keep reusable assets in the library and one-off assets in the lesson folder. Reuse by ID instead of repeating definitions in every step.

Resolve assets from declared roots, check existence and path containment, detect duplicate IDs, and preserve license/source details. Distinguish an unknown license from permission to redistribute. Reference images may guide construction without being copied into distributed lessons. No runtime network asset dependency, database, uploads or cloud storage is required.

## 8. Specialist responsibilities

Define separate role instructions and concise handoff artifacts. Roles can run sequentially in one agent or use available subagents without depending on an eight-process fleet.

| Role | Owned result |
| --- | --- |
| Education Planner | Objectives, level-appropriate scope, sequence and factual evidence |
| Visual Director | Concept-to-visual teaching choices and unmistakable target focus |
| Asset Planner | Reuse search, asset plan, provenance and capability gaps |
| Scene Composer | Semantic scene graph, hierarchy and component bindings |
| Choreography Agent | Steps, actions, camera intent, deterministic state and fallbacks |
| Content Writer | Concise explanations aligned with objectives and visible targets |
| Validator / Critic | Contract failures, educational clarity, focus, design inheritance and accessibility |
| Optimizer | Remove repetition and reuse defaults/components/assets without weakening clarity |

Education precedes visual planning; scene targets precede final choreography. Parallel work is appropriate only for independent bounded work after shared inputs are fixed. One coordinator reconciles changes and owns the final package. Independent forward-testing of the completed skill is planned in an isolated temporary project.

## 9. Validation and testing

Use layered checks with actionable JSON paths and nonzero exit codes:

- Structural: schemas, discriminated action parameters, version support, generated type parity.
- Semantic: unique identity/object/step/asset IDs, parent existence and acyclic hierarchy, action/camera/content targets, comparison/flow endpoints, design references and required runtime capabilities.
- Filesystem: assets exist, configured roots and references stay in-project, browser asset mappings resolve, repeated topics at different levels do not collide.
- Behavioral: a new project gets a project-specific design; supplied reference choices are reflected; topic generation preserves an existing profile; missing design routes correctly; another agent can follow installed instructions.
- Rendered/educational: explained objects are unmistakable, scenes match the copy, desktop/mobile behavior and backward scrolling work, reduced motion and readable fallback content are usable.

Use Node's test runner for validator/installer positive and negative cases, including malformed actions, broken targets, unsupported capabilities, traversal, duplicate IDs and invalid versions. Generate TypeScript and compile integration templates in a disposable compatible Next.js fixture where practical. Run actual installation/discovery and realistic designer/topic exercises in an isolated project; do not substitute grep checks for workflow tests. Preserve minimal inputs and concise evidence, remove generated output. Report environment limitations separately from passed checks.

## 10. Milestones and local Git delivery

Make a scoped local commit whenever a meaningful milestone is complete and its relevant checks pass:

1. Repository inspection and proposed implementation plan.
2. Approved task breakdown, package layout and installation/discovery mechanism.
3. Versioned schemas, TypeScript contracts and executable validation.
4. Designer workflow and reference/design-inheritance exercises.
5. Topic orchestration, role handoffs and asset reuse workflow.
6. Runtime integration contract and tested adaptable templates.
7. Minimal examples and end-to-end installation/workflow tests.
8. Documentation, cleanup and final verification.

Split additional independently useful fixes into further commits when justified. Avoid empty commits and arbitrary file-by-file splits merely to increase the count. Stage exact paths, inspect each staged diff, and keep commit messages specific. Keep all commits local; do not push, publish, rewrite dates or alter Git identity. Milestone boundaries can be refined in the approved task list.

## 11. Assumptions and risks requiring attention

- Product name is ExplainAI; repository name remains `explore-ai`; installable skill name is `explain-ai`.
- Codex is the first supported host. Standard skill instructions should remain portable, but other hosts are not claimed tested.
- A broad action vocabulary does not imply universal geometry support. Runtime capability validation is essential to prevent valid-but-unrenderable lessons.
- Structural validators cannot prove visual teaching quality or factual correctness. Realistic agent exercises and rendered review are separate acceptance checks.
- Initial runtime setup is more expensive than subsequent lessons; avoid recreating it on every invocation.
- The local installer must package validation dependencies correctly. A copied folder with broken imports is not an acceptable installation.
- The request for no stored design means no production/default theme. Minimal explicit fixtures remain necessary to test schema and reference behavior.
- Exact level interpretation, visual style and target-project folder conventions are deferred to skill use, not hardcoded during this build.

## Approval boundary

The original build prompt explicitly says: "Then present the plan to me for verification" and "Wait for my verification." Implementation begins after Faik verifies or corrects this proposal. The next action is to turn the approved architecture into a concrete tracked task list, then complete implementation, testing, cleanup and final review.
