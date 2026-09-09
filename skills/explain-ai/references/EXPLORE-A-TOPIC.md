# Explore a topic

Input: level, subject and topic. Optional: topic key, references, curriculum notes, desired depth, must-include concepts and existing assets. Reuse supplied information; ask only for a missing input or an ambiguity that changes the educational outcome. Do not ask the user to design the story.

## 1. Establish project context

Run the read-only inspector from DESIGNER.md. If design is missing or invalid, complete designer first; if it is unconfigured, adopt it. Record the existing design SHA-256 and ID. Read configuration, design, local asset index and implemented runtime/component registry. A topic request is not permission to redesign the project.

Use the project's level taxonomy and curriculum notes. `k5` is a catalog key, not a universal age standard. If scope can be inferred reasonably, record it; otherwise clarify the level once. Inspect the user's references, verify factual claims against suitable sources and label intentional simplifications. Avoid unsupported educational assertions, invented curriculum alignment or made-up citations.

## 2. Plan the educational and visual story

Create a compact working table with: learning objective, explanation, exact semantic target, visual teaching technique, asset/component choice and fallback. Keep planning notes small and task-local; do not introduce required duplicate lesson manifests.

Choose an order that builds understanding: orient the learner, introduce the relevant whole, examine its parts or process, compare where helpful, then reconnect the detail to the whole and conclude. Sequence depends on the subject; this is not a fixed slide formula. Dissection, extraction, magnification, flow and scale are teaching tools, not decoration. Do not use the same effect for every concept merely because its handler already exists.

Use the roles in AGENT-ROLES.md when useful. Asset planning precedes final scene/choreography: search local components and metadata, assess semantic anatomy, then decide reuse/procedural/new/reference. Creating new reusable geometry is allowed when required; keep its behavior in target-project components rather than executable lesson JSON.

## 3. Compose the package

Read LESSON-SPEC.md and the lesson schema. Use:

```text
content/<level>/<subject>/<topicKey>/lesson.json
content/<level>/<subject>/<topicKey>/assets/   only when needed
```

`lessonId` is `level/subject/topicKey`. Preserve the user's explicit topic key; otherwise derive a readable lowercase hyphenated key. `slug` is the route-facing name and can differ. Repeated topics across levels must coexist. The route tuple is `level/subject/slug`; validate the full catalog for collisions.

Build semantic object paths and immediate parents before writing actions. Resolve each object to a reviewed component and optional asset/material preset. Write level-appropriate concise copy. For every exact object/part mentioned, include it in that step's `explains`, then make it visually unmistakable with emphasis, framing or a suitable technique. A parent highlight is not automatically enough for a tiny child.

Each step describes its own state starting from the canonical scene baseline. Do not depend on a prior step having revealed/extracted an object. Supply camera intent and meaningful `alt` text. Optional precise vectors express geometry, never code. Use profile pacing/durations by default and per-step overrides only where pedagogically justified. Narration hooks reference local audio assets; audio must not be necessary to understand the content.

## 4. Integrate and validate

Check needed actions against actual component anatomy/handlers. Extend a missing runtime using RUNTIME.md and the adaptable templates; do not mark an action implemented by merely putting it in the capability manifest. If an alternative is educationally equivalent, use it and state the tradeoff. JSON schema validity does not imply renderer compatibility.

Adapt to the existing Next.js App Router. Prefer server-side filesystem loading and a client scene boundary. A project lacking catalog routes may get levels → subjects → topics → lesson routes. Do not rebuild an existing application or add storage services. Preserve nearby layouts and styling. Use configured paths and public asset mapping.

Run structural and full project validation, then integrated copy checks where applicable. Fix failures. Preview explained targets, backward scrolling, resize/mobile, keyboard navigation, reduced motion and no-WebGL output. Confirm copy remains available without the canvas. Compare the design fingerprint with the initial value; if it changed unexpectedly, reconcile only your unintended changes before delivery.

## 5. Critique, optimise and deliver

Check sources, level appropriateness and actual target visibility. Remove redundant style fields and repeated assets, prefer inherited defaults, and reuse existing components. Revalidate after optimisation. Do not remove meaningful focus or explanatory text to minimise JSON size.

Report generated paths, chosen teaching techniques, reusable components/assets added, validation results and preview limitations. Preserve evidence that distinguishes checked JSON from observed runtime behavior. Complete the requested integration; if the environment blocks visual preview, state that specific limitation and provide the exact local steps for the user to verify it.
