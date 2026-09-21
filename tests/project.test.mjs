import { test } from "node:test";
import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, writeFile, rm, mkdir } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { validateProject } from "../skills/explore-ai/scripts/validate.mjs";
import { install } from "../scripts/install.mjs";
import { acceptedFixture } from "./workflow-fixtures.mjs";
const example = new URL(
  "../skills/explore-ai/examples/project/",
  import.meta.url,
);
async function trial(run) {
  const root = await mkdtemp(path.join(os.tmpdir(), "explore-ai-project-"));
  try {
    await cp(example, root, { recursive: true });
    await acceptedFixture(root);
    await run(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
async function edit(root, file, change) {
  const location = path.join(root, file);
  const value = JSON.parse(await readFile(location, "utf8"));
  change(value);
  await writeFile(location, JSON.stringify(value, null, 2));
}
const first = "content/k1/maths/equal-parts/lesson.json";
test("topic and integrated validation reject missing or stale acceptance while draft checks remain usable", async () => {
  await trial(async root => {
    await rm(path.join(root, ".explore-ai/workflow.json"));
    for (const options of [{ integrated: true }, { lesson: first }]) {
      const result = await validateProject(root, options);
      assert.equal(result.valid, false);
      assert.equal(result.errors[0].code, "DESIGN_NOT_ACCEPTED");
    }
    assert.equal((await validateProject(root)).valid, true);
    await acceptedFixture(root);
    await writeFile(path.join(root, "preview.html"), "changed after acceptance");
    assert.equal((await validateProject(root, { integrated: true })).errors[0].code, "DESIGN_NOT_ACCEPTED");
  });
});
test("both example levels pass full filesystem and browser copy validation", async () => {
  await trial(async (root) => {
    const result = await validateProject(root, { integrated: true });
    assert.equal(result.valid, true, JSON.stringify(result.errors));
    assert.equal(result.lessons, 2);
  });
});
for (const [name, change, match] of [
  [
    "wrong catalog identity",
    (root) => edit(root, first, (v) => (v.lessonId = "k9/maths/equal-parts")),
    /level\/subject/,
  ],
  [
    "unsupported schema version",
    (root) => edit(root, first, (v) => (v.schemaVersion = "1.0.0")),
    /Migration required: .*migrate\.mjs.*--project/,
  ],
  [
    "unknown action",
    (root) =>
      edit(root, first, (v) => (v.steps[0].actions[0].action = "run-code")),
    /constant/,
  ],
  [
    "malformed action parameters",
    (root) =>
      edit(
        root,
        first,
        (v) => (v.steps[0].actions = [{ action: "extract", target: "shape" }]),
      ),
    /offset/,
  ],
  [
    "asset traversal",
    (root) =>
      edit(
        root,
        "asset-library/index.json",
        (v) => (v.assets[0].path = "../secret.svg"),
      ),
    /pattern/,
  ],
  [
    "missing local source",
    (root) => rm(path.join(root, "asset-library/diagrams/equal-parts.svg")),
    /ENOENT/,
  ],
  [
    "stale browser copy",
    (root) =>
      writeFile(
        path.join(root, "public/explore-ai/library/diagrams/equal-parts.svg"),
        "<svg/>",
      ),
    /differs/,
  ],
  [
    "duplicate asset",
    (root) =>
      edit(root, "asset-library/index.json", (v) => v.assets.push(v.assets[0])),
    /Duplicate ID/,
  ],
  [
    "unimplemented camera",
    (root) => edit(root, first, (v) => (v.steps[0].camera.mode = "inside")),
    /Unsupported camera/,
  ],
  [
    "wrong narration type",
    (root) =>
      edit(
        root,
        first,
        (v) => (v.steps[0].narrationAssetId = "equal-parts-diagram"),
      ),
    /audio/,
  ],
])
  test(`project rejects ${name}`, async () => {
    await trial(async (root) => {
      await change(root);
      let result;
      try {
        result = await validateProject(root, { integrated: true });
      } catch (error) {
        result = { valid: false, errors: [error.message] };
      }
      assert.equal(result.valid, false);
      assert.match(JSON.stringify(result.errors), match);
    });
  });
test("route collisions are detected across distinct topic keys", async () => {
  await trial(async (root) => {
    const source = JSON.parse(await readFile(path.join(root, first), "utf8"));
    source.topicKey = "another";
    source.lessonId = "k1/maths/another";
    await mkdir(path.join(root, "content/k1/maths/another"));
    await writeFile(
      path.join(root, "content/k1/maths/another/lesson.json"),
      JSON.stringify(source),
    );
    const result = await validateProject(root);
    assert.match(JSON.stringify(result.errors), /Duplicate route/);
  });
});
test("installed CLI runs independently from the development checkout", async () => {
  await trial(async (root) => {
    const installed = await install(root);
    // Copy installed dependency closure to exercise offline runtime resolution.
    await cp(
      new URL("../skills/explore-ai/node_modules/", import.meta.url),
      path.join(installed, "node_modules"),
      { recursive: true },
    );
    const result = spawnSync(
      process.execPath,
      [
        path.join(installed, "scripts/validate.mjs"),
        "--project",
        root,
        "--integrated",
      ],
      { cwd: root, encoding: "utf8" },
    );
    assert.equal(result.status, 0, result.stderr + result.stdout);
    assert.equal(JSON.parse(result.stdout).lessons, 2);
    const bad = spawnSync(
      process.execPath,
      [
        path.join(installed, "scripts/validate.mjs"),
        "--project",
        root,
        "--bogus",
      ],
      { cwd: root, encoding: "utf8" },
    );
    assert.notEqual(bad.status, 0);
  });
});
