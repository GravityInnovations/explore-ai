import { test } from "node:test";
import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { migrateProject } from "../skills/explain-ai/scripts/migrate.mjs";

const example = fileURLToPath(new URL("../skills/explain-ai/examples/project/", import.meta.url));
const owned = [
  "asset-library/index.json",
  "content/k1/maths/equal-parts/lesson.json",
  "content/k2/maths/equal-parts/lesson.json",
  "design/profile.json",
  "explain-ai.config.json",
  "explain-ai.runtime.json",
];

async function trial(run) {
  const root = await mkdtemp(path.join(os.tmpdir(), "explain-ai-migration-"));
  try {
    await cp(example, root, { recursive: true });
    for (const relative of owned) {
      const file = path.join(root, relative);
      const value = JSON.parse(await readFile(file, "utf8"));
      value.schemaVersion = "1.0.0";
      await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
    }
    await run(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

async function findTemporaryFiles(root) {
  const matches = [];
  async function visit(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const child = path.join(folder, entry.name);
      if (entry.isDirectory()) await visit(child);
      else if (entry.name.endsWith(".explain-ai-migrate.tmp")) matches.push(child);
    }
  }
  await visit(root);
  return matches;
}

test("migration plans first, writes atomically, preserves other files, and is idempotent", async () => {
  await trial(async (root) => {
    const unrelated = path.join(root, "client-notes.txt");
    await writeFile(unrelated, "keep me\n");
    const before = await readFile(path.join(root, owned[0]));
    const plan = await migrateProject(root);
    assert.equal(plan.status, "planned");
    assert.deepEqual(plan.files.map((file) => file.path), owned);
    assert.deepEqual(await readFile(path.join(root, owned[0])), before);
    await assert.rejects(readFile(path.join(root, ".explain-ai/migrations/1.0.0-to-2.0.0/backup/explain-ai.config.json")));

    const result = await migrateProject(root, { write: true });
    assert.equal(result.status, "migrated");
    assert.equal(JSON.parse(await readFile(path.join(root, owned[0]), "utf8")).schemaVersion, "2.0.0");
    assert.equal(
      JSON.parse(await readFile(path.join(root, "design/profile.json"), "utf8")).accessibility.fallback,
      "text-and-diagram",
    );
    assert.deepEqual(
      await readFile(path.join(root, ".explain-ai/migrations/1.0.0-to-2.0.0/backup", owned[0])),
      before,
    );
    assert.equal(await readFile(unrelated, "utf8"), "keep me\n");
    assert.deepEqual(await findTemporaryFiles(root), []);

    const migratedBytes = await Promise.all(owned.map((relative) => readFile(path.join(root, relative))));
    const second = await migrateProject(root, { write: true });
    assert.equal(second.status, "already-migrated");
    assert.deepEqual(
      await Promise.all(owned.map((relative) => readFile(path.join(root, relative)))),
      migratedBytes,
    );
  });
});

test("migration refuses a backup collision before changing contracts", async () => {
  await trial(async (root) => {
    const collision = path.join(root, ".explain-ai/migrations/1.0.0-to-2.0.0/backup/explain-ai.config.json");
    await mkdir(path.dirname(collision), { recursive: true });
    await writeFile(collision, "different\n");
    const before = await readFile(path.join(root, "explain-ai.config.json"));
    await assert.rejects(migrateProject(root, { write: true }), /Backup collision/);
    assert.deepEqual(await readFile(path.join(root, "explain-ai.config.json")), before);
  });
});

test("migration rejects unknown versions with an actionable command", async () => {
  await trial(async (root) => {
    const file = path.join(root, "explain-ai.runtime.json");
    const value = JSON.parse(await readFile(file, "utf8"));
    value.schemaVersion = "9.0.0";
    await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
    await assert.rejects(migrateProject(root), /no migration is available.*migrate\.mjs.*--project/);
  });
});

test("migration validates transformed output before creating backups", async () => {
  await trial(async (root) => {
    const file = path.join(root, "design/profile.json");
    const value = JSON.parse(await readFile(file, "utf8"));
    delete value.id;
    await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
    await assert.rejects(migrateProject(root, { write: true }), /migrated output is invalid/);
    await assert.rejects(readdir(path.join(root, ".explain-ai")));
  });
});
