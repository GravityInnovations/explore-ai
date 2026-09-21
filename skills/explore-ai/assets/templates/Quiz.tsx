import { useState } from "react";
import {
  createQuizSession,
  retryQuiz,
  submitQuizAnswer,
  type QuizQuestion,
} from "./quiz-state";

export type QuizProps = {
  questions: readonly QuizQuestion[];
  seed: number;
};

export function Quiz({ questions, seed }: QuizProps) {
  const [session, setSession] = useState(() => createQuizSession(questions, seed));
  const [attempt, setAttempt] = useState(1);
  const answered = new Map(session.responses.map((response) => [response.questionId, response]));
  return (
    <section aria-labelledby="quiz-title">
      <h2 id="quiz-title">Knowledge check</h2>
      {questions.map((question) => {
        const response = answered.get(question.id);
        return (
          <fieldset key={question.id} disabled={Boolean(response)}>
            <legend>{question.prompt}</legend>
            {question.answers.map((answer) => (
              <label key={answer.id}>
                <input
                  type="radio"
                  name={question.id}
                  value={answer.id}
                  onChange={() => setSession((current) => submitQuizAnswer(current, question.id, answer.id))}
                />
                {answer.text}
              </label>
            ))}
            {response && (
              <p role="status">{response.correct ? response.explanation : `Correction: ${response.explanation}`}</p>
            )}
          </fieldset>
        );
      })}
      {session.complete && (
        <div role="status">
          <p>Score: {session.score}%</p>
          {session.mastered ? <p>Knowledge check complete.</p> : (
            <button type="button" onClick={() => { setAttempt((value) => value + 1); setSession(retryQuiz(questions, seed + attempt)); }}>
              Try again
            </button>
          )}
        </div>
      )}
    </section>
  );
}
