# ExploreAI Early K–2 showcase

Independent showcase product for Kindergarten through Grade 2 learners, approximately ages 5–7.

The shared visual template implements the prescribed profile for [issue #51](https://github.com/GravityInnovations/explore-ai/issues/51), within [parent #50](https://github.com/GravityInnovations/explore-ai/issues/50) and the [shared shell contract #56](https://github.com/GravityInnovations/explore-ai/issues/56). **Preview ready; design QA and Faik's acceptance are pending.** No lesson content, answers, sources or catalog entries are included.

## Local setup

From the repository root:

```powershell
node scripts/install.mjs examples/showcase/early-k2
npm.cmd ci --prefix examples/showcase/early-k2/.agents/skills/explore-ai --ignore-scripts --no-audit --no-fund
npm.cmd ci --prefix examples/showcase/early-k2 --ignore-scripts --no-audit --no-fund
```

The personal `examples/playground/` is unrelated and must remain untouched.

## Run locally

From this folder:

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd run start -- --hostname 127.0.0.1 --port 3051
```

For editing, use `npm.cmd run dev -- --hostname 127.0.0.1 --port 3051` instead of start. Stop the other server first. Development, build and start regenerate the ignored `catalog/index.json` using the installed ExploreAI builder; its entries are currently empty. After future lesson additions, run `npm.cmd run catalog:build` to refresh a running development server's catalog.

| Route | Template behavior |
| --- | --- |
| `/` | Permanent welcome with an Explore lessons CTA |
| `/catalog` | Separate catalog; only real available levels, or an honest empty state |
| `/catalog/[level]` | Subjects belonging to exactly that level |
| `/catalog/[level]/[subject]` | Lessons belonging to exactly that level and subject |
| `/lesson/[level]/[subject]/[slug]` | Exact catalog lookup and shared shell; player integration deferred |
| `/design-preview` | Clearly labelled level/subject empty compositions and a lesson-stage design study; no catalog fixture data |

Unknown levels, subjects and lessons return the shared not-found page. With no content, none of the parameterized routes represents an available lesson. The material study exists only on the design preview. It is not a completed Three.js lesson runtime or a knowledge check.

## Template ownership

`app/layout.tsx` reads the unchanged `design/profile.json` into shared CSS tokens and imports local Fredoka/Nunito Sans fonts. `components/AppShell.tsx` adapts the installed shell contract. `PageTemplate` owns page headings, breadcrumbs, empty states and real catalog choices. `lib/catalog.ts` consumes the installed `CatalogRoutes.ts` helper and generated catalog, with no second catalog model.

`LessonTemplate` exposes stage, text, controls and knowledge-check slots for later integration. Its preview uses the installed desktop gate (768 CSS pixels), a Three.js rounded material study and GSAP ScrollTrigger. Reduced motion skips the canvas and uses static illustration/text with button-driven steps. WebGL failure retains illustration/text. The Home illustration is original decorative SVG; it asserts no educational facts. All assets and fonts are local.

Preserve Home, Catalog, grouping routes and shared components during later topic authoring. Real lesson rendering, semantic actions, educational diagrams and knowledge checks must be integrated after acceptance, without presenting this decorative preview as lesson functionality.

## Validation and acceptance boundary

Local typecheck and production build passed for this template. The build emits the existing multiple-lockfile workspace-root warning. A brief local browser check observed Home → Catalog, the honest empty catalog, the 3D preview and its Next control. A disabled-control contrast issue found in that check was corrected. These observations are not full design QA or acceptance.

Still required: desktop/narrow-screen composition, label contrast, complete keyboard order/focus, normal/reduced-motion behavior, no-WebGL fallback and explicit design acceptance for the current preview. Populated route navigation, additive lessons, semantic runtime behavior and knowledge checks are future lesson work. No complex tests, agent trials, remote runs, PRs or publication were performed.

The local ignored `.explore-ai/workflow.json` records the prescribed brief and preview, with acceptance unset. Do not infer acceptance from the valid profile, a successful build, or this README. Issue #51 remains open. Current work is split into local visual-foundation and route/preview commits, per Faik's request for multiple commits; the broader issue's lesson milestone has not been started.
