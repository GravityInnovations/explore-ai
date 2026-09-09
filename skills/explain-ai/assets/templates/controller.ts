import type { Action, Lesson, Step } from "../../types/lesson";
import type { Design } from "../../types/design";

export type ActionHandlers = {
  [K in Action["action"]]?: (
    action: Extract<Action, { action: K }>,
    progress: number,
  ) => void;
};
export interface SceneAdapter {
  /** Restore owned transforms, visibility, materials and camera without allocating a new scene. */
  resetBaseline(): void;
  handlers: ActionHandlers;
  camera(intent: Step["camera"], progress: number): void;
  render(step: Step): void;
  /** Dispose only resources owned by this lesson instance. */
  dispose(): void;
}

export function createLessonController(
  lesson: Lesson,
  design: Design,
  adapter: SceneAdapter,
) {
  const weights = lesson.steps.map(
    (step) => step.scrollUnits ?? design.motion.scrollUnits,
  );
  if (!weights.length || weights.some((w) => !Number.isFinite(w) || w <= 0))
    throw new Error("Invalid step pacing");
  for (const step of lesson.steps)
    for (const action of step.actions) {
      if (!adapter.handlers[action.action])
        throw new Error(`Missing action handler: ${action.action}`);
    }
  const total = weights.reduce((a, b) => a + b, 0);
  let disposed = false;
  function showStep(index: number, progress = 1, reducedMotion = false) {
    if (disposed) throw new Error("Lesson controller is disposed");
    const step = lesson.steps[index];
    if (!Number.isInteger(index) || !step || !Number.isFinite(progress))
      throw new Error("Invalid step or progress");
    const t = reducedMotion ? 1 : Math.max(0, Math.min(1, progress));
    adapter.resetBaseline();
    // Camera intent is sampled first; explicit orbit/follow actions can then refine it.
    adapter.camera(step.camera, t);
    for (const action of step.actions) {
      const handler = adapter.handlers[action.action] as (
        action: Action,
        progress: number,
      ) => void;
      handler(action, t);
    }
    adapter.render(step);
    return { index, progress: t };
  }
  function seek(progress: number, reducedMotion = false) {
    if (!Number.isFinite(progress)) throw new Error("Invalid progress");
    let distance = Math.max(0, Math.min(1, progress)) * total;
    for (let i = 0; i < weights.length; i++) {
      if (distance < weights[i] || i === weights.length - 1)
        return showStep(i, distance / weights[i], reducedMotion);
      distance -= weights[i];
    }
    throw new Error("No lesson steps");
  }
  return {
    showStep,
    seek,
    dispose() {
      if (!disposed) {
        disposed = true;
        adapter.dispose();
      }
    },
  };
}
export type LessonController = ReturnType<typeof createLessonController>;
