# Integration hotspots

| Template | Responsibility | Adaptation required |
| --- | --- | --- |
| `controller.ts` | Baseline resets, explicit action dispatch, absolute/weighted progress, reduced-motion endpoints and disposal | Implement a real `SceneAdapter` and semantic handlers |
| `scroll.ts` | Connect lesson sections to GSAP ScrollTrigger and media-query cleanup | Match actual sections, layout/pacing and navigation; refresh after layout changes |
| `camera.ts` | Conservative bounds framing using the viewport's limiting field of view | Handle occlusion, surrounding context, inside/orbit and exact overrides |
| `LessonText.tsx` | Unstyled server-readable explanation, anchors and optional local diagram | Apply project design and resolve the diagram URL |

After copying templates into a target project, adjust relative type imports. Keep filesystem modules on the server and scene/GSAP code behind a client boundary. Templates do not implement all nineteen action effects; do not advertise unsupported geometry in the runtime manifest.

Own lifecycle resources explicitly. Restore baseline before sampling, avoid accumulating transforms or per-scroll tween creation, and dispose only resources owned by the lesson instance. Text and diagram remain available if WebGL fails. See [RUNTIME.md](../../references/RUNTIME.md) for the complete integration sequence and production loading guidance.
