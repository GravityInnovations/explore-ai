import type { Lesson } from "../../types/lesson";

/** Theme-neutral readable content. Render on the server; keep it when WebGL fails. */
export function LessonText({
  lesson,
  diagramUrl,
  runtimeError,
}: {
  lesson: Lesson;
  diagramUrl?: string;
  runtimeError?: string;
}) {
  const prefix = `lesson-${lesson.level}-${lesson.subject}-${lesson.slug}`;
  return (
    <article className="explain-ai-lesson-copy" aria-labelledby={`${prefix}-title`}>
      <h1 id={`${prefix}-title`}>{lesson.title}</h1>
      <p>{lesson.accessibility.summary}</p>
      {runtimeError && <p role="alert">{runtimeError}</p>}
      <nav aria-label="Lesson steps">
        <ol>
          {lesson.steps.map((step) => (
            <li key={step.id}>
              <a href={`#${prefix}-${step.id}`}>{step.title}</a>
            </li>
          ))}
        </ol>
      </nav>
      {diagramUrl && (
        <figure>
          <img src={diagramUrl} alt={lesson.accessibility.summary} />
          <figcaption>{lesson.metadata.summary}</figcaption>
        </figure>
      )}
      {lesson.steps.map((step) => (
        <section
          className="explain-ai-lesson-step"
          key={step.id}
          id={`${prefix}-${step.id}`}
          data-lesson-step={step.id}
          tabIndex={-1}
          aria-labelledby={`${prefix}-${step.id}-title`}
        >
          <h2 id={`${prefix}-${step.id}-title`}>{step.title}</h2>
          <p>{step.text}</p>
          <p>{step.alt}</p>
        </section>
      ))}
    </article>
  );
}
