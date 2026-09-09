# Install ExplainAI in a target project

## Try it inside this repository

No separate repository is required. `examples/playground/` is prepared as a blank personal trial project. From this repository root, run:

```powershell
node scripts/install.mjs ./examples/playground
npm.cmd ci --prefix ./examples/playground/.agents/skills/explain-ai --ignore-scripts --no-audit --no-fund
```

Then open `examples/playground/` as the project in Codex (or launch `codex` from that directory). Invoke `$explain-ai designer`, then `$explain-ai explore-a-topic` with your level, subject and topic. Ask it to initialise a Next.js App Router TypeScript application in this target directory if you want to preview the result. See the [playground instructions](examples/playground/README.md) for ready-to-use prompts.

The skill has not been pre-installed and no app has been generated there: this is your installation trial. Generated files, including the copied skill, app, content and dependencies, are ignored by Git. The existing `skills/explain-ai/examples/project/` is a shipped JSON/asset fixture with no renderer; do not use it as your mutable app folder.

This is a copy-based installation. Later source-skill edits do not automatically update the playground copy; follow the update instructions below when you want to retest a newer version.

## Recommended: local checkout

Use this route while implementation commits remain local. You need Node.js 22+, npm, and a Codex host supporting repository skills. Create or select an existing project directory; installation does not create a Next.js application.

From the ExplainAI checkout:

```sh
node scripts/install.mjs /absolute/path/to/target-project
```

PowerShell example:

```powershell
node scripts/install.mjs 'W:\Projects\My Lesson Project'
Set-Location 'W:\Projects\My Lesson Project\.agents\skills\explain-ai'
npm.cmd ci --ignore-scripts --no-audit --no-fund
```

The helper copies the complete skill folder, including its MIT license, schemas, scripts, templates and examples. It excludes `node_modules` and refuses to replace an existing installation. Dependency installation needs registry access or a populated npm cache. No API key or paid API is required by this package; your agent host has its own account/usage requirements.

An alternative is to copy `skills/explain-ai` manually to `<target-project>/.agents/skills/explain-ai`, then run the same dependency command there. Keep all supporting files together. Do not copy only `SKILL.md`. `npm install` in the repository root alone does not install the skill or its separate runtime dependencies.

## Verify discovery and invocation

Open the target project in Codex. The skill should appear in its selector; mention it explicitly as `$explain-ai` in Codex CLI/IDE, or select it in the host's skill UI. Restart Codex if discovery has not refreshed.

When Codex CLI is on PATH, verify actual discovery from the ExplainAI checkout:

```sh
node scripts/check-discovery.mjs /absolute/path/to/target-project
```

This starts a short-lived local Codex app-server, performs a read-only `skills/list` query and checks the exact installed path. It does not launch a model turn. Set `CODEX_BIN` to the executable path if needed. This diagnostic uses an experimental app-server API; the skill itself does not depend on that API to run.

Within the installed skill folder, confirm its toolchain works:

```sh
node scripts/validate.mjs --project examples/project --integrated
```

Then invoke `$explain-ai designer` in the target project, followed by `$explain-ai explore-a-topic` with level, subject and topic. Tools run against the explicit target root. Generated design/content belongs to that project, outside the installed skill directory.

## Updates and removal

The installer refuses an existing destination so it cannot silently destroy local skill edits. Compare the installed folder with a newer checkout, preserve any changes, then explicitly move the old installation aside and install the replacement. Reinstall its pinned dependencies and rerun validation. Updating the skill does not migrate or overwrite project design/lessons automatically; schema changes need an explicit migration.

To remove the skill, remove only the installed `.agents/skills/explain-ai` folder after checking for local modifications. Keep project design, content, assets and runtime unless you independently want to remove those.

## GitHub installation after publication

Once the implementation exists on GitHub, Codex's bundled skill-installer can install the `skills/explain-ai` subdirectory from `GravityInnovations/explore-ai`. Ask it to use that exact repository/path and the desired published revision. Do not use this method to test unpushed local work. Run the installed package's `npm ci` afterwards.

This version is a standalone local skill. A plugin/marketplace wrapper is a possible future distribution step; none is registered or published by this repository.

Official mechanism: [OpenAI Build skills](https://learn.chatgpt.com/docs/build-skills) documents local `.agents/skills` discovery, explicit selection, automatic discovery and bundled installer support. The development acceptance check also verifies the actual installed Codex host rather than relying on folder presence alone.
