# Repository maintenance

ExplainAI is an installable agent skill. The approved architecture is in IMPLEMENTATION-PLAN.md and the current checklist is TASKS.md. The original prompt's plan approval has been satisfied; do not reintroduce that gate.

- Keep the installable package self-contained in skills/explain-ai. Keep schemas authoritative and regenerate TypeScript when contracts change.
- Preserve the MIT license, user changes and project-specific design choices. Ship only minimal examples, no production website, fixed theme, cloud backend or large asset library.
- Test script behavior, semantic references, asset containment, design inheritance and installation. Distinguish structural, behavioral and rendered evidence.
- Complete meaningful milestones with scoped local commits. Stage exact paths and inspect staged checks/diffs. Do not push unless Faik explicitly requests it.
- Use independent subagents for bounded forward-testing of this complex skill in isolated temporary projects once the package is usable. Share the skill and raw scenario inputs, not the expected answer. The coordinator reviews resulting artifacts and fixes demonstrated issues.
- Avoid unnecessary broad builds; runtime templates still need focused typechecks and behavior tests. Exclude temporary output and dependency folders from commits.
- Use the GitHub issues mapped in ISSUES.md to track project changes. Reference the relevant issue in new commit messages and update its acceptance/status when work changes. Keep testing proportional: focused checks for changes, one full delivery check, and no repeated agent/browser trials without new evidence. A local commit is not a published remote commit.
