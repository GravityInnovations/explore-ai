import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { runWorkflow, QUESTIONS } from "../skills/explain-ai/scripts/workflow-actions.mjs";

export async function agreeBrief(root) {
  let state = await runWorkflow(root, "start");
  for (const key of Object.keys(QUESTIONS)) state = await runWorkflow(root, "answer",
    { key, value: `Fixture ${key}`, source: "user", evidence: `Test customer supplied ${key}` }, state.revision);
  state = await runWorkflow(root, "brief", { summary: "A compact, accessible test design" }, state.revision);
  return runWorkflow(root, "agree", { fingerprint: state.brief.fingerprint, statement: "Test customer approves this specific brief" }, state.revision);
}

test("brief agreement cannot skip decisions or target an old revision", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-brief-"));
  try {
    let s = await runWorkflow(root, "start");
    await assert.rejects(runWorkflow(root, "brief", { summary: "Premature" }, s.revision), { code: "MISSING_DECISIONS" });
    await assert.rejects(runWorkflow(root, "agree", { fingerprint: "x", statement: "yes" }, s.revision), { code: "INVALID_TRANSITION" });
    for (const key of Object.keys(QUESTIONS)) s = await runWorkflow(root, "answer",
      { key, value: `Proposed ${key}`, source: "proposed", evidence: "Test proposal to be reviewed" }, s.revision);
    s = await runWorkflow(root, "brief", { summary: "Review all these proposals" }, s.revision);
    assert.equal(s.topicReady, false);
    await assert.rejects(runWorkflow(root, "agree", { fingerprint: "0".repeat(64), statement: "yes" }, s.revision), { code: "STALE_REVIEW" });
    await assert.rejects(runWorkflow(root, "agree", { fingerprint: s.brief.fingerprint, statement: " " }, s.revision), { code: "INVALID_INPUT" });
    s = await runWorkflow(root, "agree", { fingerprint: s.brief.fingerprint, statement: "Test customer agrees to the reviewed proposals" }, s.revision);
    assert.equal(s.stage, "design");
    assert.equal(s.topicReady, false);
  } finally { await rm(root, { recursive: true, force: true }); }
});
