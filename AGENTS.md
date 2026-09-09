# Repository maintenance

ExplainAI is an installable agent skill. Use GitHub issues for work tracking, commit mappings and acceptance evidence. Keep repository documentation focused on current installation, usage and maintenance.

- Keep the installable package self-contained in skills/explain-ai. Keep schemas authoritative and regenerate TypeScript when contracts change.
- Preserve the MIT license, user changes and project-specific design choices. Ship only minimal examples, no production website, fixed theme, cloud backend or large asset library.
- Test script behavior, semantic references, asset containment, design inheritance and installation. Distinguish structural, behavioral and rendered evidence.
- Complete meaningful milestones with scoped local commits. Stage exact paths and inspect staged checks/diffs. Do not push unless Faik explicitly requests it.
- Reserve independent forward-testing for substantial behavior changes when authorised. Do not run agent trials for documentation or routine cleanup.
- Avoid unnecessary broad builds; runtime templates still need focused typechecks and behavior tests. Exclude temporary output and dependency folders from commits.
- Reference the relevant GitHub issue in new commit messages and update its acceptance/status when work changes. Keep testing proportional: focused checks for changes, one full delivery check when warranted, and no repeated agent/browser trials without new evidence. A local commit is not a published remote commit.
- `examples/playground/` is the ignored personal trial area. A user-requested Next.js lesson application may be generated there; the no-production-site boundary applies to the shipped skill package. Preserve the tracked playground setup instructions and do not commit generated trial files unless Faik requests it.
