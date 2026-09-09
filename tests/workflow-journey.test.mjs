import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { runWorkflow, QUESTIONS } from "../skills/explain-ai/scripts/workflow-actions.mjs";
import { fixture } from "./fixtures.mjs";

export async function previewFixture(root) {
  const f = fixture();
  await mkdir(path.join(root, "design"), { recursive: true });
  await writeFile(path.join(root, "explain-ai.config.json"), JSON.stringify(f.config));
  await writeFile(path.join(root, "design/profile.json"), JSON.stringify(f.design));
  await writeFile(path.join(root, "preview.html"), "<!doctype html><h1>Design fixture</h1>");
}

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

test("preview review requires current evidence and blocks failed or waived core QA", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-qa-"));
  try {
    await previewFixture(root);
    let s = await agreeBrief(root);
    s = await runWorkflow(root, "preview", { url: "http://localhost:3100", paths: ["preview.html"] }, s.revision);
    assert.equal(s.qa.find(q => q.check === "contracts").result, "pass");
    await assert.rejects(runWorkflow(root, "review", {}, s.revision), { code: "QA_BLOCKED" });
    await assert.rejects(runWorkflow(root, "qa", { check: "contracts", result: "pass", evidence: "fake", fingerprint: s.preview.fingerprint }, s.revision), { code: "INVALID_INPUT" });
    await assert.rejects(runWorkflow(root, "qa", { check: "mobile", result: "not-applicable", evidence: "skip", fingerprint: s.preview.fingerprint }, s.revision), { code: "INVALID_INPUT" });
    s = await runWorkflow(root, "qa", { check: "desktop", result: "fail", evidence: "Fixture text overlaps the diagram", fingerprint: s.preview.fingerprint }, s.revision);
    await assert.rejects(runWorkflow(root, "review", {}, s.revision), { code: "QA_BLOCKED" });
    await writeFile(path.join(root, "preview.html"), "changed");
    await assert.rejects(runWorkflow(root, "qa", { check: "desktop", result: "pass", evidence: "Fixed", fingerprint: s.preview.fingerprint }, s.revision), { code: "STALE_PREVIEW" });
    s = await runWorkflow(root, "revise", { target: "design", note: "Resolve overlap" }, s.revision);
    assert.equal(s.stage, "design");
    assert.deepEqual(s.qa, []);
  } finally { await rm(root, { recursive: true, force: true }); }
});
