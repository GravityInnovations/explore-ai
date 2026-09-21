export type QuizAnswer = {
  id: string;
  text: string;
  correct: boolean;
  explanation?: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  answers: readonly QuizAnswer[];
};

export type QuizResponse = {
  questionId: string;
  answerId: string;
  correct: boolean;
  explanation: string;
  firstSubmission: boolean;
};

export type QuizSession = {
  questions: readonly QuizQuestion[];
  responses: readonly QuizResponse[];
  score: number;
  complete: boolean;
  mastered: boolean;
  seed: number;
};

export function createQuizSession(
  questions: readonly QuizQuestion[],
  seed: number,
): QuizSession {
  return {
    questions,
    responses: [],
    score: 0,
    complete: false,
    mastered: false,
    seed,
  };
}

export function submitQuizAnswer(
  session: QuizSession,
  questionId: string,
  answerId: string,
): QuizSession {
  if (session.responses.some((response) => response.questionId === questionId))
    return session;
  const question = session.questions.find((item) => item.id === questionId);
  const answer = question?.answers.find((item) => item.id === answerId);
  if (!question || !answer) return session;
  const response: QuizResponse = {
    questionId,
    answerId,
    correct: answer.correct,
    explanation: answer.correct
      ? answer.explanation ?? "Correct."
      : question.answers.find((item) => item.correct)?.explanation ?? "Review the lesson and try again.",
    firstSubmission: true,
  };
  const responses = [...session.responses, response];
  const complete = responses.length === session.questions.length;
  const score = Math.round(
    (responses.filter((item) => item.correct).length / session.questions.length) * 100,
  );
  return { ...session, responses, score, complete, mastered: complete && score === 100 };
}

export function retryQuiz(
  questions: readonly QuizQuestion[],
  seed: number,
): QuizSession {
  return createQuizSession(questions, seed);
}
