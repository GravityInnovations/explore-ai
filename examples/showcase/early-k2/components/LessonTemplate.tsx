"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { DesktopLessonGate } from "../.agents/skills/explore-ai/assets/templates/DesktopLessonGate";
import { DesignStage } from "./DesignStage";

// Future lessons fill these slots inside the shared shell, never replace its routes.
export function LessonTemplate({ stage, children, controls, knowledgeCheck }: { stage: ReactNode; children: ReactNode; controls: ReactNode; knowledgeCheck: ReactNode }) {
  return <div className="lesson-template"><section aria-label="Lesson stage">{stage}</section><div>{children}</div>{controls}<section aria-label="Knowledge check">{knowledgeCheck}</section></div>;
}

export function LessonTemplatePreview() {
  const [step, setStep] = useState(0);
  return <DesktopLessonGate message="Open this lesson template on a desktop or laptop, at least 768 pixels wide. Home and Catalog work on smaller screens too.">{() =>
    <LessonTemplate stage={<DesignStage step={step} />} controls={
      <nav className="lesson-controls" aria-label="Preview steps"><button className="button" disabled={step === 0} onClick={() => setStep(step - 1)}>← Back</button><output aria-live="polite">Preview step {step + 1} of 2</output><button className="button primary" disabled={step === 1} onClick={() => setStep(step + 1)}>Next →</button></nav>
    } knowledgeCheck={<div className="template-copy"><h3>Knowledge check space</h3><p className="muted">Questions, feedback and retry controls belong here after lesson authoring.</p></div>}>
      <div className="template-copy"><h3>{step === 0 ? "A space to explore" : "A space to pause"}</h3><p>{step === 0 ? "This template keeps short, readable text beneath a single visual stage." : "Back and Next stay in the same place. Reduced motion keeps the illustration still."}</p></div>
    </LessonTemplate>
  }</DesktopLessonGate>;
}
