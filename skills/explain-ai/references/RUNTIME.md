# Target-project runtime integration

The package includes adaptable TypeScript building blocks, not a production app or universal geometry engine. Inspect the user's existing Next.js/Three.js/GSAP versions and conventions; adapt imports and component layout. Do not install development dependencies from this repository into their project wholesale.

## Integration sequence

1. Load and validate filesystem JSON on the server. Resolve catalog keys through the configured root; never pass an unchecked route parameter directly to filesystem APIs. The route hierarchy is levels → subjects → topics → lesson. Resolve route `slug` to its validated lesson record rather than assuming it equals `topicKey`.
2. Pass only serialisable lesson/design data to a client scene component. Keep filesystem modules out of client bundles. Render `LessonText.tsx` (or adapt existing semantic markup) on the server so content survives canvas or JavaScript failure. Its anchor navigation provides a keyboard route through the steps.
3. Build reviewed component instances and a `Map<string, Object3D>` for semantic IDs. Check exact nested anatomy against source models; register every declared object. Snapshot owned baseline transforms, visibility, material settings, clipping and camera once. Reuse material presets from the project design.
4. Implement the `SceneAdapter` and only the handlers the lesson needs. Check actual maps and handlers against the runtime manifest before rendering. Use discriminated action types, not dynamic evaluation or arbitrary JSON callbacks.
5. Use `controller.ts` to sample deterministic step state. Reset to baseline before sampling; never compound offsets or create a tween on every scroll callback. Cache paused GSAP timelines per reusable action if useful, seek them with absolute progress, and use inherited easing. Handlers must show emphasis clearly throughout the interval when its explanation is active.
6. Connect matching text sections using `scroll.ts` after assets are ready. Size sections using each step's `scrollUnits` or the design default and a readable minimum. Place the scene beside the text using the project's layout; do not bake a permanent theme into the skill. Refresh ScrollTrigger after async layout changes. Explicit navigation must update scroll position and focus the matching text section.
7. Map local assets using ASSETS.md. Build static reviewed imports for source components; do not import arbitrary paths from lesson JSON. Validate full catalog, capability declarations and browser asset copies.

## Template usage

Copy only needed files from `assets/templates/` into an appropriate target-project runtime folder. Copy generated declarations from `types/` or adapt imports to the existing contract module. The shipped relative type imports work inside this package and **must be adjusted after copying**. These are templates for the user's agent to integrate, not a drop-in Next.js route.

`controller.ts` requires explicit action handlers and owns sequencing, pacing, reduced-motion sampling and disposal. `scroll.ts` uses real GSAP/ScrollTrigger APIs with media-query context cleanup. `camera.ts` provides bounds fitting for wide/medium/close/macro/top/side/best; inside/orbit require deliberate geometry-aware camera handlers. `LessonText.tsx` is unstyled semantic content with anchors and an optional locally resolved diagram.

Example adapter pattern (inside the target project):

```ts
const controller = createLessonController(lesson, design, {
  resetBaseline: restoreOwnedSceneState,
  handlers: {
    highlight: (action, progress) => emphasiseSemanticTarget(action.target, progress),
    extract: (action, progress) => setOffsetFromBaseline(action.target, action.offset, progress),
  },
  camera: sampleSemanticCamera,
  render: renderSceneAndLabels,
  dispose: disposeOwnedResources,
});
```

The functions above are project-specific responsibilities, not exported helpers. Implement them against actual geometry. Populate `explain-ai.runtime.json` using `schemas/runtime.schema.json` only after handlers exist. A component supports an action only when it exposes the needed anatomy and semantics. A global cutaway handler does not make every asset dissectable.

## Camera and animation decisions

Compute useful framing from world bounds, aspect ratio, field of view and object occlusion. `frameBounds` fits a bounding sphere without mutating the camera. Apply position/lookAt, update near/far and projection, and respect user overrides. Its conservative far plane may need enlargement for surrounding context. Recompute when viewport/bounds change. Inside views and comparisons need custom framing; do not reuse a single-object fit blindly.

Action values are relative to the canonical baseline described in LESSON-SPEC.md. Convert degrees to radians once. Use actual clipping planes/separable parts for cutaway/dissect, directed geometry or particles for flow, and simultaneous framing for comparison. Apply step camera first, then let explicit orbit/follow refine it. Avoid per-frame allocations and shader recompilation. Preserve shared materials by cloning only where the lesson owns a change.

## Accessibility, lifecycle and verification

Respect `prefers-reduced-motion` at mount and when it changes: show stable endpoint states, no ambient motion, smooth scroll or forced pinning. Preserve all text and a useful static diagram, keyboard navigation, readable labels and non-colour emphasis. A reduced-motion controller alone cannot stop unrelated project animation; inspect the whole scene.

In React effects, return cleanup that reverts the GSAP context, stops render loops, removes listeners/observers and disposes lesson-owned textures/materials/geometries and renderer. Do not dispose shared cached assets. Handle cancelled async loads before mounting and dispose late results. React Strict Mode can mount/clean up twice; create a fresh controller each mount. The provided controller disposal is idempotent.

Use a ResizeObserver or the project's resize infrastructure; update renderer size, camera aspect/projection and responsive bounds. Cap pixel ratio according to the design. On WebGL creation/context failure, keep the server-rendered explanation and diagram visible; do not leave a blank lesson.

Before reporting integration complete, inspect representative beginning/middle/end steps, reverse scroll and direct anchors, desktop/mobile widths, reduced motion and no-WebGL fallback. Validate asset loading in the actual browser. Report separately what was typechecked, unit tested and visually observed.

API references checked while building v1: [Next.js server/client boundaries](https://nextjs.org/docs/app/getting-started/server-and-client-components), [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), [Three.js documentation](https://threejs.org/docs/).
