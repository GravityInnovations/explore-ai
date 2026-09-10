# Local designer CLI

Use Node.js 22+ and the installed skill's dependencies. Always supply the explicit customer root. One operational record, `.explain-ai/workflow.json`, holds resumable progress. Keep it with project design work; it is application state, not a duplicate project-management plan.

```text
node <installed-skill>/scripts/workflow.mjs <command> --project <root> [--input <relative.json>] [--expect <revision>] [--json]
```

Every mutation after start requires `--expect` from status. Input is a JSON file inside the target project; a reusable `.explain-ai/request.json` is suitable. Never interpolate customer statements into shell code. Default output guides the next step; JSON output gives structured blockers. Errors return nonzero with a stable code. There is no force, skip or auto-accept option.

## Commands

| Command | Required JSON fields | Stage / outcome |
| --- | --- | --- |
| `start` | none | Start only if absent; otherwise resume unchanged |
| `status` | none | Read progress, decisions, fingerprints and blockers |
| `answer` | key, value, source, evidence | Interview; record a decision |
| `brief` | summary | All decision keys required; enter brief review |
| `agree` | fingerprint, statement | Record explicit brief agreement; permit design work |
| `preview` | url, paths | Design; fingerprint preview and enter QA; run contracts |
| `check` | empty object | QA; rerun automatic contract/contrast checks |
| `qa` | check, result, evidence, fingerprint | Record observed QA for the exact preview |
| `review` | empty object | Require complete non-failing QA; enter design review |
| `accept` | fingerprint, statement | Record explicit customer acceptance |
| `revise` | target, note | After brief submission; target brief or design; clear downstream reviews |
| `restart` | reason | Archive prior workflow, clear interview, preserve authored files |
| `preflight` | none | Nonzero unless acceptance and preview files remain current |

Decision keys: `audience`, `brand`, `typography`, `palette`, `layout`, `visuals`, `motion`, `accessibility`, `constraints`. Source: `user`, `delegated` or `proposed`. Brief agreement covers all recorded decisions; source tags alone are not approval.

Example answer:

```json
{
  "key": "brand",
  "value": "Use a text wordmark; logo design is deferred.",
  "source": "user",
  "evidence": "The customer explicitly asked to leave the logo until later."
}
```

Agreement and acceptance payloads use the fingerprint returned by status and the actual user statement for the revision shown. Reuse explicit agreement already given to that revision; do not ask twice. Implementation-plan approval is separate from design acceptance. Never transform an ambiguous reply into explicit approval.

## Preview scope and evidence

`paths` lists the source/style/component/asset files or directories determining the preview. The config and configured design are always included. Include imported shared styles, fonts and components. Directory scopes detect additions/removals. Prefer precise preview scopes to entire app trees that later receive unrelated lesson routes. Do not omit design dependencies to evade re-review; the CLI cannot infer every framework's import graph.

Vendor/build/workflow directories are excluded. Paths are contained, portable and cannot be symlinks. URLs must be HTTP(S) without credentials. Recording a URL does not prove it runs; desktop QA must observe the submitted page rendering.

| Check | Required evidence |
| --- | --- |
| contracts | Computed by the CLI; cannot be manually passed |
| desktop | Rendered preview URL, composition, hierarchy and clipping |
| mobile | Observed narrow viewport dimensions, ordering and overflow |
| labels | Readability/contrast over forms and correct target identification |
| keyboard | Observed tab order, visible focus and keyboard-operated controls |
| motion | Observed normal and reduced-motion behaviour; static previews can remain static in both |
| fallback | Observed text/diagram without canvas, or concrete reason no canvas-dependent content exists |
| app-check | Applicable build/typecheck/smoke command and result, or reason no such check applies |

Result: `pass`, `fail`, or `not-applicable`. Only fallback/app-check allow not-applicable with rationale. Use concrete evidence, for example "At 390×844, text follows the diagram; no horizontal overflow", rather than "looks good". An unavailable required observation remains pending. Fix code before resubmitting changed previews and record honest current evidence. Final review reruns contracts and requires every current QA entry to be non-failing.

## Recovery and enforcement limits

- STALE_REVISION: another mutation won; read status and reconcile.
- BUSY: a writer holds the lock; retry after it finishes. A crash can leave `.explain-ai/workflow.lock`; verify no writer remains before removing only that lock. No automatic lock stealing.
- STALE_PREVIEW / DESIGN_NOT_ACCEPTED: follow blockers and revise; missing legacy state is unreviewed.
- INVALID_STATE: preserve and repair the record; never silently replace it with accepted state.
- Restart is for an explicit customer request. It archives under `.explain-ai/history/` and leaves the app/profile untouched. Existing designs still require discussion.

The CLI enforces supported transitions and revision checks. It does not authenticate humans, establish the truth of manual observations, crawl previews, execute builds or sandbox an unrestricted agent. The skill requires real customer agreement and observed evidence. An actor able to rewrite all files can bypass local tooling; this is not tamper-proof enforcement.

Standalone schema checks and unflagged draft catalog validation remain usable before acceptance. They do not authorise topics: use preflight, then selected-lesson or integrated validation at delivery.
