import { test } from "node:test";
import assert from "node:assert/strict";
import { fixture } from "./fixtures.mjs";
import {
  validateSemantics,
  validateDesign,
  critiqueEmphasis,
  critiqueCopy,
} from "../skills/explain-ai/scripts/validate.mjs";
const check = (f) => validateSemantics(f.lesson, f.design, f.index, f.runtime);
test("coherent semantic package passes", () =>
  assert.deepEqual(check(fixture()), []));

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
