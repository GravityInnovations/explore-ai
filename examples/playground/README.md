# Personal ExplainAI playground

Use this folder to install and test the skill without creating a separate repository. It starts with setup instructions only. Your generated application, design, lessons, assets and copied skill remain ignored by the parent repository.

## Install it yourself

From `W:\GravityInnovations\explore-ai` in PowerShell:

```powershell
node scripts/install.mjs ./examples/playground
npm.cmd ci --prefix ./examples/playground/.agents/skills/explain-ai --ignore-scripts --no-audit --no-fund
```

Open this `examples/playground` folder as the project in Codex, or run:

```powershell
Set-Location W:\GravityInnovations\explore-ai\examples\playground
codex
```

Select `explain-ai` in the skill picker; restart Codex if it has not appeared.

## Establish your design

```text
$explain-ai designer
Use this folder as the target project. Help me establish a design for interactive
educational lessons. Ask me the important design questions one at a time.
```

You can provide a screenshot, CSS or reference site instead of answering from scratch.

## Generate and preview a lesson

```text
$explain-ai explore-a-topic
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
