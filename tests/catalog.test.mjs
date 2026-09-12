import { test } from "node:test";
import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { buildCatalog } from "../skills/explain-ai/scripts/build-catalog.mjs";

const example = new URL("../skills/explain-ai/examples/project/", import.meta.url);

test("catalog builder plans and writes a deterministic additive catalog", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "explain-ai-catalog-"));
  try {
    await cp(example, root, { recursive: true });
    await writeFile(path.join(root, "home.html"), "existing home");
    const plan = await buildCatalog(root);
    assert.equal(plan.status, "planned");
    await assert.rejects(readFile(path.join(root, "catalog/index.json")));
    const written = await buildCatalog(root, { write: true });
    assert.equal(written.entries.length, 2);
    assert.deepEqual(written.entries.map((entry) => entry.route), ["k1/maths/equal-parts", "k2/maths/equal-parts"]);
    const first = await readFile(path.join(root, "catalog/index.json"), "utf8");
    await buildCatalog(root, { write: true });
    assert.equal(await readFile(path.join(root, "catalog/index.json"), "utf8"), first);
    assert.equal(await readFile(path.join(root, "home.html"), "utf8"), "existing home");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("catalog builder rejects route collisions and scans only configured content", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "explain-ai-catalog-collision-"));
  try {
    await cp(example, root, { recursive: true });
    await cp(
      path.join(root, "content/k1/maths/equal-parts"),
      path.join(root, "content/k1/maths/duplicate"),
      { recursive: true },
    );
    const duplicate = path.join(root, "content/k1/maths/duplicate/lesson.json");
    const value = JSON.parse(await readFile(duplicate, "utf8"));
    value.topicKey = "duplicate";
    value.slug = "equal-parts";
    value.lessonId = "k1/maths/duplicate";
    await writeFile(duplicate, `${JSON.stringify(value, null, 2)}\n`);
    await assert.rejects(buildCatalog(root), /Catalog route collision/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
