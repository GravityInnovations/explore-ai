# Integration hotspots

| Template | Responsibility | Adaptation required |
| --- | --- | --- |
| `controller.ts` | Baseline resets, explicit action dispatch, absolute/weighted progress, reduced-motion endpoints and disposal | Implement a real `SceneAdapter` and semantic handlers |
| `scroll.ts` | Connect lesson sections to GSAP ScrollTrigger and media-query cleanup | Match actual sections, layout/pacing and navigation; refresh after layout changes |
| `camera.ts` | Conservative bounds framing using the viewport's limiting field of view | Handle occlusion, surrounding context, inside/orbit and exact overrides |
| `LessonText.tsx` | Unstyled server-readable explanation, anchors, optional local diagram and WebGL error message | Apply project design and resolve the diagram URL |
| `DesktopLessonGate.tsx` | Fixed 768px lesson support boundary and server-safe phone message | Keep heavy renderer invocation inside the supported children callback |
| `runtime.ts` | Primary Three.js scene/camera/renderer and GSAP ScrollTrigger lifecycle boundary | Provide the target canvas/section and connect controller progress |
| `LessonStage.tsx` | Persistent visual stage, ordered copy, one scroll progress model and Next/Previous controls | Connect the target runtime factory and keep step styling unboxed |
| `CatalogRoutes.ts` | Pure level → subject → lesson route model from catalog entries | Render it through the target project's existing shell; never replace the root route |
| `AppShell.tsx` | Shared shell boundary for catalog and lesson entrypoints | Apply the accepted profile tokens once; keep lesson-specific composition inside `children` |
| `quiz-state.ts` | Session-only locked answers, first-submission score and retry state | Keep question selection/authoring in the lesson contract; do not persist learner data |
| `Quiz.tsx` | Accessible correction, score and retry presentation | Apply project shell tokens; browser proof belongs to the E2E harness |

After copying templates into a target project, adjust relative type imports. Keep filesystem modules on the server and scene/GSAP code behind a client boundary. Templates do not implement all nineteen action effects; do not advertise unsupported geometry in the runtime manifest.

Own lifecycle resources explicitly. Restore baseline before sampling, avoid accumulating transforms or per-scroll tween creation, and dispose only resources owned by the lesson instance. Text remains available and an optional configured diagram may be shown if WebGL fails. See [RUNTIME.md](../../references/RUNTIME.md) for the complete integration sequence and production loading guidance.
