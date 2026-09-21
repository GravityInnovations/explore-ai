import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { inspectProject } from "../skills/explore-ai/scripts/inspect.mjs";
import { fixture } from "./fixtures.mjs";
test("inspection distinguishes valid profiles from customer acceptance without rewriting", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "explore-ai-inspect-"));
  try {
    assert.equal((await inspectProject(root)).design.status, "missing");
    const f = fixture();
    await mkdir(path.join(root, "design"));
    const profile = path.join(root, "design/profile.json");
    const bytes = JSON.stringify(f.design, null, 2) + "\n";
    await writeFile(profile, bytes);
    assert.equal((await inspectProject(root)).design.status, "unconfigured");
    await writeFile(
      path.join(root, "explore-ai.config.json"),
      JSON.stringify(f.config),
    );
    const result = await inspectProject(root);
    assert.equal(result.design.status, "valid");
    assert.equal(result.workflow.topicReady, false);
    assert.equal(result.workflow.stage, "unstarted");
    assert.equal(result.design.sha256.length, 64);
    assert.equal(await readFile(profile, "utf8"), bytes);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
