import { useEffect, useRef, type ReactNode } from "react";
import type { Lesson } from "../../types/lesson";
import type { LessonController } from "./controller";
import { connectLessonScroll } from "./scroll";
import { LessonText } from "./LessonText";

export type LessonStageRuntime = (
  canvas: HTMLCanvasElement,
  sections: HTMLElement[],
) => void | (() => void);

/** Persistent stage composition: one canvas, ordered copy and one progress model. */
export function LessonStage({
  lesson,
  controller,
  runtime,
  diagramUrl,
  runtimeError,
  controls = true,
}: {
  lesson: Lesson;
  controller: LessonController;
  runtime: LessonStageRuntime;
  diagramUrl?: string;
  runtimeError?: string;
  controls?: boolean;
}): ReactNode {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursor = useRef(0);
  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const sections = [...stage.querySelectorAll<HTMLElement>("[data-lesson-step]")];
    const runtimeCleanup = runtime(canvas, sections);
    const scrollCleanup = connectLessonScroll(controller, sections, (index) => {
      cursor.current = index;
    });
    return () => {
      scrollCleanup();
      runtimeCleanup?.();
    };
  }, [controller, runtime]);
  const move = (delta: number) => {
    const sections = [...(stageRef.current?.querySelectorAll<HTMLElement>("[data-lesson-step]") ?? [])];
    const index = Math.max(0, Math.min(sections.length - 1, cursor.current + delta));
    const section = sections[index];
    if (!section) return;
    section.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    controller.showStep(index, 1, window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    cursor.current = index;
  };
  return (
    <div className="explore-ai-lesson-stage" ref={stageRef}>
      <div className="explore-ai-lesson-visual" aria-label="Interactive lesson scene">
        <canvas ref={canvasRef} aria-label={`${lesson.title} 3D scene`} />
      </div>
      <div className="explore-ai-lesson-content">
        <LessonText lesson={lesson} diagramUrl={diagramUrl} runtimeError={runtimeError} />
        {controls && (
          <nav className="explore-ai-lesson-controls" aria-label="Lesson navigation">
            <button type="button" onClick={() => move(-1)}>Previous</button>
            <button type="button" onClick={() => move(1)}>Next</button>
          </nav>
        )}
      </div>
    </div>
  );
}
