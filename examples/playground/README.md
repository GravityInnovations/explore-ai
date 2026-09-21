# Personal ExploreAI playground

Use this folder to install and test the skill without creating a separate repository. It starts with setup instructions only. Your generated application, design, lessons, assets and copied skill remain ignored by the parent repository.

## Run an existing local demo

If this folder already contains the generated `package.json`, run these commands from this folder:

```powershell
npm.cmd ci --no-audit --no-fund
npm.cmd run dev
```

The design demo opens at http://127.0.0.1:3100. If dependencies are already installed, only `npm.cmd run dev` is needed. Stop it with Ctrl+C. The demo has observation, focus and connection steps plus an optional motion toggle; it uses a text wordmark while the logo is deferred. Its generated `DEMO.md` describes the implementation and reusable design profile.

The generated app is local and ignored, so it will not appear in a fresh clone. If there is no `package.json`, follow the installation and generation steps below. Do not rerun the skill installer when `.agents/skills/explore-ai` already exists; it intentionally refuses to overwrite an installed copy.

## Install it yourself

From `W:\GravityInnovations\explore-ai` in PowerShell:

```powershell
node scripts/install.mjs ./examples/playground
npm.cmd ci --prefix ./examples/playground/.agents/skills/explore-ai --ignore-scripts --no-audit --no-fund
```

Open this `examples/playground` folder as the project in Codex, or run:

```powershell
Set-Location W:\GravityInnovations\explore-ai\examples\playground
codex
```

Select `explore-ai` in the skill picker; restart Codex if it has not appeared.

## Establish your design

Designer now conducts a guided interview before implementation, asks you to agree the brief, builds a preview, records QA and requests your acceptance. Topics stay blocked until that acceptance is current. To disregard an earlier trial's proposed choices, explicitly ask for a fresh designer interview; the CLI archives its workflow state without deleting the app or design files.

```text
$explore-ai designer
Use this folder as the target project. Help me establish a design for interactive
educational lessons. Ask me the important design questions one at a time.
```

You can provide a screenshot, CSS or reference site instead of answering from scratch.

## Generate and preview a lesson

Use this after accepting the design preview. A valid profile or working demo alone does not complete the designer stage.

```text
$explore-ai explore-a-topic
Level: k5
Subject: science
Topic: plant cell

Use this folder as the target project and preserve its design profile.
Initialise a Next.js App Router TypeScript app here if needed, implement the
required Three.js/GSAP runtime, generate the lesson and start a local preview.
Keep the trial within this folder. Do not modify the parent skill source.
```

The folder deliberately has no prebuilt application. Its existing README, AGENTS.md and installed `.agents/` folder mean an empty-directory scaffolder may refuse to run: initialise the app in place while preserving them. Create the app's own `package.json` here; do not install app dependencies into the parent repository.

Once the app exists, its generated README/package scripts describe how to start it, usually `npm.cmd run dev` from this folder. The bundled fixtures are format examples, not a ready-made website.

The installed skill is a copy. When its source changes, compare and replace the installed copy explicitly; the installer will not overwrite it silently. Keep your authored profile/content when updating the skill. Commit or delete trial output only when you choose to.
