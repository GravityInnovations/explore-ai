# Personal trial scope

This directory is a user-owned test project inside the ExploreAI skill repository. When Faik invokes the installed skill here, the target root is this directory, not the parent repository or the skill's bundled example fixture.

- Creating a local Next.js/Three.js/GSAP application here is allowed when requested. Initialise it in place and preserve these instructions, README.md and any installed `.agents/` files.
- Give the trial its own package.json. Keep design, lesson content, assets, application code and dependencies in this directory.
- Use the installed `.agents/skills/explore-ai` copy. Do not edit the parent skill source to make a trial pass; report a demonstrated package issue instead.
- Do not stage or commit generated trial files, upload content or publish the app unless Faik explicitly asks.
- Keep verification proportional and focused. Let Faik personally assess the generated lesson; do not launch repeated agent/browser trials without a concrete reason.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
