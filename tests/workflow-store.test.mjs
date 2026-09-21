import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readdir, writeFile, readFile, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { newState, loadState, updateState, snapshot } from "../skills/explain-ai/scripts/workflow-store.mjs";

test("workflow writes are atomic, revision-checked and fail closed", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-store-"));
  try {
    assert.equal(await loadState(root), null);
    await updateState(root, null, () => newState());
    await assert.rejects(updateState(root, 7, s => s), { code: "STALE_REVISION" });
    await assert.rejects(updateState(root, 0, s => ({ ...s, stage: "accepted" })), { code: "INVALID_STATE" });
    assert.equal((await loadState(root)).revision, 0);
    const results = await Promise.allSettled([updateState(root, 0, s => s), updateState(root, 0, s => s)]);
    assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
    await writeFile(path.join(root, ".explore-ai/workflow.json"), "broken");
    await assert.rejects(loadState(root), { code: "INVALID_STATE" });
    assert.equal(await readFile(path.join(root, ".explore-ai/workflow.json"), "utf8"), "broken");
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("legacy project state migrates once without rewriting workflow bytes", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-legacy-state-"));
  try {
    const state = JSON.stringify({ ...newState(), revision: 4 }, null, 2) + "\n";
    await mkdir(path.join(root, ".explain-ai"));
    await writeFile(path.join(root, ".explain-ai/workflow.json"), state);
    const loaded = await loadState(root);
    assert.equal(loaded.revision, 4);
    assert.equal(await readFile(path.join(root, ".explore-ai/workflow.json"), "utf8"), state);
    await assert.rejects(readFile(path.join(root, ".explain-ai/workflow.json")), { code: "ENOENT" });
    await updateState(root, 4, current => current);
    assert.equal(JSON.parse(await readFile(path.join(root, ".explore-ai/workflow.json"), "utf8")).revision, 5);
    await assert.rejects(readFile(path.join(root, ".explain-ai/workflow.json")), { code: "ENOENT" });
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("conflicting project state roots fail without choosing one", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-state-conflict-"));
  try {
    await mkdir(path.join(root, ".explore-ai"));
    await mkdir(path.join(root, ".explain-ai"));
    await assert.rejects(loadState(root), { code: "STATE_CONFLICT" });
    assert.deepEqual(await readdir(path.join(root, ".explore-ai")), []);
    assert.deepEqual(await readdir(path.join(root, ".explain-ai")), []);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("preview fingerprints detect edits and enforce contained scopes", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-snapshot-"));
  try {
    await writeFile(path.join(root, "page.html"), "first");
    const first = await snapshot(root, ["page.html"]);
    await writeFile(path.join(root, "page.html"), "second");
    assert.notEqual(await snapshot(root, ["page.html"]), first);
    await assert.rejects(snapshot(root, ["../outside"]), /Unsafe/);
    await assert.rejects(snapshot(root, ["node_modules"]), { code: "UNSAFE_SCOPE" });
  } finally { await rm(root, { recursive: true, force: true }); }
});
