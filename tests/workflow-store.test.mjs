import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { newState, loadState, updateState, snapshot } from "../skills/explore-ai/scripts/workflow-store.mjs";

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
