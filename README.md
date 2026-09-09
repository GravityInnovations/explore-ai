# ExplainAI

An MIT-licensed agent skill for creating project-specific design profiles and declarative, scroll-driven 3D educational lessons in Next.js projects.

Install it into your project, then ask your own coding agent to establish the design and explore a topic. Lessons inherit that design, reuse local assets, address semantic objects such as `cell.nucleus`, and describe visual intent through validated JSON.

## Install from this checkout

Requires Node.js 22+, npm and a Codex environment supporting local skills. From this repository:

```sh
node scripts/install.mjs /absolute/path/to/your-project
```

Then, inside `<your-project>/.agents/skills/explain-ai`:

```sh
npm ci --ignore-scripts --no-audit --no-fund
```

On Windows use `npm.cmd` in PowerShell and quote paths containing spaces. Open the target project in Codex and select `explain-ai`. See [installation and verification](INSTALL.md) for manual copying, discovery, updates and eventual GitHub installation. A GitHub install cannot retrieve commits that exist only locally.

## Use

```text
$explain-ai designer
Use this project's existing CSS and the supplied reference to establish its design.
```

```text
$explain-ai explore-a-topic
Level: k5
Subject: science
Topic: plant cell
```

`designer` and `explore-a-topic` are workflows within one skill, not shell commands. The first inspects the project/reference and asks only useful unresolved questions. The second plans the educational story, composes semantic targets, reuses assets, generates JSON, validates it and integrates the lesson into the target project's runtime.

Default project outputs:

```text
explain-ai.config.json
design/profile.json
asset-library/index.json
content/<level>/<subject>/<topicKey>/lesson.json
```

Optional topic assets live beside their lesson. Paths adapt through configuration. Identity includes level and subject, so the same topic can appear at several levels.

## What ships

- [One skill entrypoint](skills/explain-ai/SKILL.md), focused workflow references and specialist handoffs.
- Versioned JSON schemas, generated TypeScript, semantic/filesystem validation and asset search.
- Adaptable Three.js/GSAP/React integration templates, including deterministic scroll sampling and readable fallback content.
- [Minimal examples](skills/explain-ai/references/EXAMPLES.md) demonstrating identity and shared local assets.

The target agent implements the actual geometry/runtime and project design. This repository contains no production site, fixed theme, database, accounts, subscriptions or hosted service. Nineteen action contracts are defined; advanced effects require suitable target-project handlers and geometry. They are not nineteen universally implemented rendering effects.

## Validate and develop

From the installed skill directory:

```sh
node scripts/validate.mjs --project /absolute/path/to/your-project
node scripts/validate.mjs --project /absolute/path/to/your-project --integrated
```

The second additionally verifies local browser asset copies. Neither proves factual correctness or visual quality; see [validation boundaries](skills/explain-ai/references/VALIDATION.md).

To develop this repository:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm ci --prefix skills/explain-ai --ignore-scripts --no-audit --no-fund
npm run check
```

After editing schemas, run `npm run types:generate`. See [the approved plan](IMPLEMENTATION-PLAN.md), [delivery tracker](TASKS.md) and [verification report](VERIFICATION.md) for scope, test evidence and limitations.

See [GitHub issue and commit mapping](ISSUES.md) for every local delivery milestone. Folder README files cover contract ownership, generated types, helper commands, runtime integration hotspots, examples and test maintenance.

The package remains local-first and MIT-licensed. Further storage adapters, action extensions, richer component libraries and plugin distribution can be added explicitly without changing the current project's design ownership.
