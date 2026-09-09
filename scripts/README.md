# Repository tooling

These scripts maintain or install the package. They are not needed by the target lesson renderer.

| Script | Purpose | Writes |
| --- | --- | --- |
| `install.mjs <project>` | Copy the self-contained skill to the target's `.agents/skills/explain-ai` | A new installation only; refuses an existing destination |
| `generate-types.mjs` | Generate five declarations from the authoritative schemas | `skills/explain-ai/types/` |
| `generate-types.mjs --check` | Detect declaration drift | None |
| `check-discovery.mjs <project>` | Ask the local Codex app-server to confirm the exact installed skill | No project writes or model turn |
| `check-package.mjs` | Check required files, MIT license, local documentation links and action vocabulary | None |

Use Node.js 22+. Development dependencies live at the repository root; installed validation dependencies live in the skill's own package. Keep that separation: importing root modules from installed scripts breaks portability.

`check-discovery` uses an experimental host API and a bounded subprocess timeout. Update it from the installed Codex protocol if the host changes; do not make normal skill operation depend on this diagnostic. See [INSTALL.md](../INSTALL.md) for user-facing setup and [GitHub issues](https://github.com/GravityInnovations/explore-ai/issues) for delivery traceability.
