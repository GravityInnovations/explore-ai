import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

let directory;
let quiz;
before(async () => {
  directory = await mkdtemp(path.join(os.tmpdir(), "explain-ai-quiz-"));
  const source = await readFile(new URL("../skills/explain-ai/assets/templates/quiz-state.ts", import.meta.url), "utf8");
  await writeFile(path.join(directory, "quiz-state.mjs"), ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  }).outputText);
  quiz = await import(pathToFileURL(path.join(directory, "quiz-state.mjs")));
});
after(() => rm(directory, { recursive: true, force: true }));

function questions() {
  return [
    { id: "one", prompt: "One?", answers: [{ id: "yes", text: "Yes", correct: true, explanation: "That is right." }, { id: "no", text: "No", correct: false }] },
    { id: "two", prompt: "Two?", answers: [{ id: "yes", text: "Yes", correct: true, explanation: "That is right." }, { id: "no", text: "No", correct: false }] },
  ];
}

test("locks answers, teaches correction and scores first submissions", () => {
  let session = quiz.createQuizSession(questions(), 4);
  session = quiz.submitQuizAnswer(session, "one", "no");
  assert.equal(session.responses[0].correct, false);
  assert.equal(session.responses[0].explanation, "That is right.");
  const unchanged = quiz.submitQuizAnswer(session, "one", "yes");
  assert.deepEqual(unchanged, session);
  session = quiz.submitQuizAnswer(session, "two", "yes");
  assert.equal(session.score, 50);
  assert.equal(session.complete, true);
  assert.equal(session.mastered, false);
});

test("retry resets session state with a new seed and mastery completes at 100%", () => {
  let session = quiz.createQuizSession(questions(), 1);
  session = quiz.submitQuizAnswer(session, "one", "yes");
  session = quiz.submitQuizAnswer(session, "two", "yes");
  assert.equal(session.mastered, true);
  const retry = quiz.retryQuiz(questions(), 2);
  assert.equal(retry.seed, 2);
  assert.deepEqual(retry.responses, []);
  assert.equal(retry.complete, false);
});
