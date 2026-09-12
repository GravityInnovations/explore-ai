import { test } from "node:test";
import assert from "node:assert/strict";
import { fixture } from "./fixtures.mjs";
import {
  validateSemantics,
  validateDesign,
  critiqueEmphasis,
  critiqueCopy,
  resolveColorStrategy,
  validateQuiz,
} from "../skills/explain-ai/scripts/validate.mjs";
import { critiquePedagogy } from "../skills/explain-ai/scripts/pedagogy.mjs";
import { selectQuizQuestions, shuffleQuizAnswers } from "../skills/explain-ai/scripts/quiz.mjs";
const check = (f) => validateSemantics(f.lesson, f.design, f.index, f.runtime);
test("coherent semantic package passes", () =>
  assert.deepEqual(check(fixture()), []));

test("factual steps require existing source references and preserve clean copy", () => {
  const f = fixture();
  f.lesson.metadata.contentKind = "factual";
  f.lesson.metadata.sources = [{
    id: "source-one",
    title: "Reviewed source",
    reference: "local/reviewed-source.md",
  }];
  f.lesson.steps[0].sourceRefs = ["source-one"];
  f.lesson.steps[0].simplificationNote = "Uses simpler wording for the target level.";
  assert.deepEqual(check(f), []);
  f.lesson.steps[0].sourceRefs = ["missing-source"];
  assert.match(JSON.stringify(check(f)), /Unknown source ID/);
  delete f.lesson.steps[0].sourceRefs;
  assert.match(JSON.stringify(check(f)), /sourceRefs/);
  f.lesson.steps[0].sourceRefs = ["source-one"];
  f.lesson.metadata.sources.push({
    id: "source-one",
    title: "Duplicate",
    reference: "local/duplicate.md",
  });
  assert.match(JSON.stringify(check(f)), /Duplicate source ID/);
});

test("paired grade fixtures allow richer Grade 7 detail while flagging Grade 2 overload", () => {
  const grade2 = fixture();
  grade2.lesson.level = "grade-2";
  grade2.lesson.steps[0].explains = ["shape", "shape.part", "shape.extra"];
  grade2.lesson.objects.push({ id: "shape.extra", parent: "shape", component: "box", label: "Extra", description: "Extra" });
  const grade2Warnings = critiquePedagogy(grade2.lesson);
  assert.ok(grade2Warnings.some((warning) => warning.code === "COGNITIVE_LOAD_TARGETS"));

  const grade7 = fixture();
  grade7.lesson.level = "grade-7";
  grade7.lesson.steps[0].introduces = ["ratio", "comparison"];
  grade7.lesson.steps[0].uses = ["ratio", "comparison"];
  grade7.lesson.steps[0].title = "Recap the comparison";
  grade7.lesson.steps[0].text = "Identify the marked part and recap the comparison.";
  assert.deepEqual(critiquePedagogy(grade7.lesson), []);
});

test("quiz validation and seeded selection preserve objective coverage", () => {
  const f = fixture();
  f.lesson.quiz = {
    enabled: true,
    drawCount: 3,
    questions: [1, 2, 3, 4].map((number) => ({
      id: `question-${number}`,
      objectiveIds: ["objective-1"],
      prompt: `Which part is shown ${number}?`,
      answers: [
        { id: "yes", text: "The marked part", correct: true, explanation: "It is the marked part." },
        { id: "no", text: "Another part", correct: false },
      ],
    })),
  };
  assert.deepEqual(validateQuiz(f.lesson), []);
  const first = selectQuizQuestions(f.lesson.quiz, ["objective-1"], 1);
  const second = selectQuizQuestions(f.lesson.quiz, ["objective-1"], 100);
  assert.equal(first.length, 3);
  assert.notDeepEqual(first.map((question) => question.id), second.map((question) => question.id));
  assert.equal(shuffleQuizAnswers(first[0], 1).length, first[0].answers.length);
  f.lesson.quiz.questions[0].answers[0].correct = false;
  assert.match(JSON.stringify(validateQuiz(f.lesson)), /exactly one correct/);
  f.lesson.quiz.questions[0].objectiveIds = ["objective-2"];
  assert.match(JSON.stringify(validateQuiz(f.lesson)), /Unknown objective ID/);
});

test("emphasis critic warns on repetitive highlight-only teaching without failing validation", () => {
  const f = fixture();
  f.lesson.steps = [0, 1, 2].map((index) => ({ ...f.lesson.steps[0], id: `step-${index}` }));
  assert.equal(critiqueEmphasis(f.lesson, f.runtime).length, 1);
  f.lesson.steps[1].actions = [{ action: "magnify", target: "shape.part", factor: 1.2 }];
  assert.deepEqual(critiqueEmphasis(f.lesson, f.runtime), []);
  f.runtime.actions = ["highlight"];
  f.lesson.steps[1].actions = [{ action: "highlight", target: "shape.part" }];
  assert.deepEqual(critiqueEmphasis(f.lesson, f.runtime), []);
});

test("copy critic warns on paragraph-heavy steps without truncating text", () => {
  const f = fixture();
  const original = Array.from({ length: 70 }, (_, i) => `concept${i}`).join(" ");
  f.lesson.steps[0].text = original;
  const [warning] = critiqueCopy(f.lesson);
  assert.equal(warning.code, "COPY_DENSITY");
  assert.equal(f.lesson.steps[0].text, original);
  f.lesson.steps[0].text = "First point. Second point. Third point.";
  assert.deepEqual(critiqueCopy(f.lesson), []);
});

test("lesson color strategy resolves override before accepted project default", () => {
  const f = fixture();
  assert.equal(resolveColorStrategy(f.lesson, f.design), "imitated");
  delete f.lesson.metadata.colorStrategy;
  assert.equal(resolveColorStrategy(f.lesson, f.design), "theme");
  f.lesson.metadata.colorStrategy = "unknown";
  assert.notDeepEqual(validateSemantics(f.lesson, f.design, f.index, f.runtime), []);
});
for (const [name, mutate, match] of [
  [
    "unknown target",
    (f) => (f.lesson.steps[0].actions[0].target = "shape.missing"),
    /Unknown semantic/,
  ],
  ["unsupported action", (f) => (f.runtime.actions = []), /does not support/],
  [
    "component capability",
    (f) => (f.runtime.components[0].actions = []),
    /Component/,
  ],
  ["design inheritance", (f) => (f.lesson.designId = "different"), /inherit/],
  [
    "missing emphasis",
    (f) => {
      f.lesson.steps[0].camera = { mode: "wide", target: "shape" };
      f.lesson.steps[0].actions = [{ action: "reveal", target: "shape.part" }];
    },
    /emphasis/,
  ],
  [
    "hidden explanation",
    (f) => f.lesson.steps[0].actions.push({ action: "hide", target: "shape" }),
    /hidden/,
  ],
  ["broken parent", (f) => (f.lesson.objects[1].parent = "missing"), /Parent/],
  [
    "duplicate object",
    (f) => f.lesson.objects.push(f.lesson.objects[0]),
    /Duplicate/,
  ],
  [
    "missing asset",
    (f) => (f.lesson.objects[0].assetId = "absent"),
    /Unknown asset/,
  ],
  [
    "zero cut plane",
    (f) =>
      f.lesson.steps[0].actions.push({
        action: "cutaway",
        target: "shape",
        normal: { x: 0, y: 0, z: 0 },
        constant: 0,
      }),
    /normal cannot/,
  ],
])
  test(`rejects ${name}`, () => {
    const f = fixture();
    mutate(f);
    assert.match(JSON.stringify(check(f)), match);
  });
test("design contrast is checked independently from its schema", () => {
  const f = fixture();
  assert.deepEqual(validateDesign(f.design), []);
  f.design.colors.text = "#ffffff";
  assert.match(JSON.stringify(validateDesign(f.design)), /contrast/);
});

function opacityFixture() {
  const f = fixture();
  f.runtime.actions.push("fade", "xray", "assemble");
  f.runtime.components[0].actions.push("fade", "xray", "assemble");
  return f;
}
test("ordered fade restores opacity without changing visibility", () => {
  const f = opacityFixture();
  f.lesson.steps[0].actions = [
    { action: "fade", target: "shape", opacity: 0 },
    { action: "fade", target: "shape", opacity: 1 },
    { action: "highlight", target: "shape.part" },
  ];
  assert.deepEqual(check(f), []);
  f.lesson.steps[0].actions.unshift({ action: "hide", target: "shape" });
  assert.match(JSON.stringify(check(f)), /hidden/);
});
test("reveal does not silently undo zero material opacity", () => {
  const f = opacityFixture();
  f.lesson.steps[0].actions = [
    { action: "fade", target: "shape.part", opacity: 0 },
    { action: "reveal", target: "shape.part" },
    { action: "highlight", target: "shape.part" },
  ];
  assert.match(JSON.stringify(check(f)), /hidden/);
});
test("xray can expose children without making them invisible", () => {
  const f = opacityFixture();
  f.lesson.steps[0].actions.unshift({
    action: "xray",
    target: "shape",
    opacity: 0,
  });
  assert.deepEqual(check(f), []);
});
test("assembly restores baseline state but respects hidden ancestors", () => {
  const f = opacityFixture();
  f.lesson.steps[0].actions = [
    { action: "fade", target: "shape.part", opacity: 0 },
    { action: "hide", target: "shape.part" },
    { action: "assemble", target: "shape.part" },
    { action: "highlight", target: "shape.part" },
  ];
  assert.deepEqual(check(f), []);
  f.lesson.steps[0].actions.unshift({ action: "hide", target: "shape" });
  assert.match(JSON.stringify(check(f)), /hidden/);
});
