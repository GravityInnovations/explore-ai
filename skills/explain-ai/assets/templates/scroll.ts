"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { LessonController } from "./controller";

/** Mount after scene assets and the matching text sections are ready. */
export function connectLessonScroll(
  controller: LessonController,
  sections: HTMLElement[],
) {
  if (!sections.length) throw new Error("No lesson sections");
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add(
    {
      reduced: "(prefers-reduced-motion: reduce)",
      regular: "(prefers-reduced-motion: no-preference)",
    },
    (context) => {
      const reduced = !!context.conditions?.reduced;
      controller.showStep(0, 1, reduced);
      sections.forEach((section, index) => {
        const sample = (trigger: ScrollTrigger) =>
          controller.showStep(index, trigger.progress, reduced);
        ScrollTrigger.create({
          trigger: section,
          start: "top center",
          end: "bottom center",
          onUpdate: (trigger) => {
            if (trigger.isActive) sample(trigger);
          },
          onEnter: sample,
          onEnterBack: sample,
          onLeave: () => controller.showStep(index, 1, reduced),
          onLeaveBack: () =>
            controller.showStep(Math.max(0, index - 1), 1, reduced),
        });
      });
    },
  );
  return () => {
    media.revert();
    controller.dispose();
  };
}
