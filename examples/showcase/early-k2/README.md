# ExploreAI Early K–2 showcase

Independent showcase product for Kindergarten through Grade 2 learners, approximately ages 5–7.

This commit is setup-only. It establishes the project boundary, local ExploreAI skill installation, canonical contracts, dependencies and the prescribed design profile. Home, Catalog, lesson routes, visual design and lesson content are intentionally deferred until the design workflow is completed and accepted.

## Local setup

From the repository root:

```powershell
node scripts/install.mjs examples/showcase/early-k2
npm.cmd ci --prefix examples/showcase/early-k2/.agents/skills/explore-ai --ignore-scripts --no-audit --no-fund
npm.cmd ci --prefix examples/showcase/early-k2 --ignore-scripts --no-audit --no-fund
```

The personal `examples/playground/` is unrelated and must remain untouched.
