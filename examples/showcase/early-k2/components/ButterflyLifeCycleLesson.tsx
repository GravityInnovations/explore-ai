"use client";

import { useMemo, useRef } from "react";
import type { Design } from "../.agents/skills/explore-ai/types/design";
import type { Lesson } from "../.agents/skills/explore-ai/types/lesson";
import { LessonStage } from "../.agents/skills/explore-ai/assets/templates/LessonStage";
import { createLessonController, type SceneAdapter } from "../.agents/skills/explore-ai/assets/templates/controller";
import { Quiz } from "../.agents/skills/explore-ai/assets/templates/Quiz";
import { DesktopLessonGate } from "../.agents/skills/explore-ai/assets/templates/DesktopLessonGate";
import { LessonTemplate } from "./LessonTemplate";
import { mountButterflyLifeCycleWorld, type WorldMount } from "./ButterflyLifeCycleWorld";

export function ButterflyLifeCycleLesson({ lesson, design }: { lesson: Lesson; design: Design }) {
  const mountRef = useRef<WorldMount | null>(null);
  const adapterRef = useRef<SceneAdapter | null>(null);
  const adapter = useMemo<SceneAdapter>(() => ({
    resetBaseline: () => adapterRef.current?.resetBaseline(),
    handlers: {
      focus: (action, progress) => adapterRef.current?.handlers.focus?.(action, progress),
      highlight: (action, progress) => adapterRef.current?.handlers.highlight?.(action, progress),
      hide: (action, progress) => adapterRef.current?.handlers.hide?.(action, progress),
      reveal: (action, progress) => adapterRef.current?.handlers.reveal?.(action, progress),
      magnify: (action, progress) => adapterRef.current?.handlers.magnify?.(action, progress),
    },
    camera: (intent, progress) => adapterRef.current?.camera(intent, progress),
    render: (step) => adapterRef.current?.render(step),
    dispose: () => adapterRef.current?.dispose(),
  }), []);
  const controller = useMemo(() => createLessonController(lesson, design, adapter), [lesson, design, adapter]);
  const runtime = (canvas: HTMLCanvasElement) => {
    mountRef.current?.dispose();
    const mount = mountButterflyLifeCycleWorld(canvas, lesson, design);
    mountRef.current = mount;
    adapterRef.current = mount.adapter;
    controller.showStep(0, 1, window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    return () => {
      mount.dispose();
      adapterRef.current = null;
      mountRef.current = null;
    };
  };
  const questions = lesson.quiz.questions.slice(0, lesson.quiz.drawCount).map((question) => ({
    id: question.id,
    prompt: question.prompt,
    answers: question.answers,
  }));
  return <DesktopLessonGate message="Open this lesson on a desktop or laptop, at least 768 pixels wide. The lesson text remains available on smaller screens.">
    {() => <LessonTemplate
      stage={<LessonStage lesson={lesson} controller={controller} runtime={runtime} />}
      controls={null}
      knowledgeCheck={<Quiz questions={questions} seed={51} />}
    >
      <p className="lesson-summary">{lesson.metadata.summary}</p>
    </LessonTemplate>}
  </DesktopLessonGate>;
}
