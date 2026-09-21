# Changelog

## 0.2.0

This release moves the ExploreAI data contracts to `2.0.0` while keeping the workflow state contract at `1.0.0`. Existing `1.0.0` project data must be reviewed with the dry-run migration before writing; migration creates local backups and conservatively marks ambiguous asset provenance as unknown and denied.

User-visible changes:

- Guided designer acceptance now records a reusable shared shell, client-specific logo decisions and a plain-language one-question flow.
- Catalog routes are generated deterministically as level → subject → lesson, and lesson routes remain nested.
- Lesson contracts support text fallback, semantic runtime guidance, performance budgets, color strategy inheritance, factual source traceability, grade-aware pedagogy warnings and declarative seeded quizzes.
- Asset provenance and integrated-output validation block unknown, reference-only, restricted or denied assets by default.
- Reusable templates cover the shared app shell, continuous lesson stage, quiz feedback/retry state and the Three.js/GSAP runtime boundary.
- Browser regression coverage exercises catalog-to-lesson routing, deep links, controls, quiz feedback, phone gating and real renderer/ScrollTrigger initialization.

Known limits:

- The package ships adaptable templates and validators, not a production website, fixed theme, hosted backend or universal geometry engine.
- Browser fixture checks use semantic markers; animated 3D scenes are not pixel-snapshot tested.
- Publishing, npm distribution and playground output remain separate approval steps.
