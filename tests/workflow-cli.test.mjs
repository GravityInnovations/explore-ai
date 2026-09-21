import { test } from "node:test";
import assert from "node:assert/strict";
import { access, mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { execFileSync, spawnSync } from "node:child_process";
const script = path.resolve("skills/explore-ai/scripts/workflow.mjs");

test("CLI guides an idempotent fresh start and rejects bypass flags", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-cli-"));
  const run = command => JSON.parse(execFileSync(process.execPath, [script, command, "--project", root, "--json"], { encoding: "utf8" }));
  try {
    assert.equal(run("status").stage, "unstarted");
    const first = run("start");
    assert.equal(first.question.key, "audience");
    assert.equal(first.topicReady, false);
    await access(path.join(root, ".explore-ai/workflow.json"));
    assert.equal(run("start").session, first.session);
    const bad = spawnSync(process.execPath, [script, "start", "--project", root, "--force"], { encoding: "utf8" });
    assert.equal(bad.status, 1);
    assert.equal(JSON.parse(bad.stderr).code, "INVALID_ARGUMENT");
  } finally { await rm(root, { recursive: true, force: true }); }
});
