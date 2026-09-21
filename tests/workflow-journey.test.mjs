import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { runWorkflow, QUESTIONS } from "../skills/explain-ai/scripts/workflow-actions.mjs";
import { fixture } from "./fixtures.mjs";
import { QA_CHECKS, loadState, assertState } from "../skills/explain-ai/scripts/workflow-store.mjs";

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

test("brand onboarding records supplied, deferred or reusable logo decisions without a new workflow key", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-logo-"));
  try {
    let state = await runWorkflow(root, "start");
    state = await runWorkflow(root, "answer", {
      key: "audience", value: "Visitors evaluating the showcase", source: "user", evidence: "Client supplied audience"
    }, state.revision);
    state = await runWorkflow(root, "answer", {
      key: "brand",
      value: "Client explicitly defers the logo and approves a temporary text wordmark.",
      source: "user",
      evidence: "Client explicitly chose deferment for this revision",
    }, state.revision);
    assert.equal((await runWorkflow(root, "status")).question.key, "typography");
    assert.equal((await runWorkflow(root, "status")).decisions.brand.source, "user");
    assert.match((await runWorkflow(root, "status")).decisions.brand.value, /defers/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("recommendations and options stay pending until the customer makes a concrete choice", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-resolution-"));
  try {
    let state = await runWorkflow(root, "start");
    for (const [key, value] of [["audience", "Teachers and developers"], ["brand", "Minimal and modern"]]) {
      state = await runWorkflow(root, "answer", { key, value, source: "user", evidence: "Customer supplied a concrete direction" }, state.revision);
    }
    assert.equal(state.question.key, "typography");
    state = await runWorkflow(root, "propose", {
      key: "typography", mode: "recommendation",
      options: [{ id: "nunito", value: "Nunito Sans for a friendly, modern and readable interface", rationale: "Rounded details remain approachable without losing clarity." }]
    }, state.revision);
    assert.equal(state.question.key, "typography");
    assert.equal(state.pendingChoice.mode, "recommendation");
    assert.equal(state.decisions.typography, undefined);
    await assert.rejects(runWorkflow(root, "brief", { summary: "Cannot submit yet" }, state.revision), { code: "MISSING_DECISIONS" });
    state = await runWorkflow(root, "select", { option: "nunito", evidence: "Customer accepted the recommendation" }, state.revision);
    assert.equal(state.decisions.typography.value, "Nunito Sans for a friendly, modern and readable interface");
    assert.equal(state.question.key, "palette");
    state = await runWorkflow(root, "propose", {
      key: "palette", mode: "options",
      options: [
        { id: "bright", value: "Bright playful primary colours with a calm neutral background", rationale: "Energetic while keeping the page readable." },
        { id: "calm", value: "Calm blue-green accents on a clean light background", rationale: "Modern and focused for longer explanations." },
      ]
    }, state.revision);
    assert.equal(state.question.key, "palette");
    assert.deepEqual(state.pendingChoice.options.map(option => option.id), ["bright", "calm"]);
    await assert.rejects(runWorkflow(root, "select", { option: "missing", evidence: "No such choice" }, state.revision), { code: "UNKNOWN_OPTION" });
    state = await runWorkflow(root, "select", { option: "calm", evidence: "Customer selected the calm direction" }, state.revision);
    assert.equal(state.question.key, "layout");
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("delegation stores a concrete choice and proposals cannot target another area", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-delegation-"));
  try {
    let state = await runWorkflow(root, "start");
    await assert.rejects(runWorkflow(root, "propose", {
      key: "palette", mode: "options", options: [
        { id: "a", value: "A", rationale: "A" }, { id: "b", value: "B", rationale: "B" }
      ]
    }, state.revision), { code: "OUT_OF_ORDER" });
    state = await runWorkflow(root, "delegate", {
      value: "A general-audience showcase with a clear educational purpose", evidence: "Customer asked the designer to choose the audience direction"
    }, state.revision);
    assert.equal(state.decisions.audience.source, "delegated");
    assert.notEqual(state.decisions.audience.value, "choose for me");
    assert.equal(state.question.key, "brand");
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("client questions stay one-at-a-time and free of implementation jargon", async () => {
  const forbidden = /\b(schema|cli|three\.js|gsap|qa|runtime)\b/i;
  for (const text of Object.values(QUESTIONS)) assert.equal(forbidden.test(text), false, text);
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-questions-"));
  try {
    let state = await runWorkflow(root, "start");
    assert.equal(state.question.key, "audience");
    state = await runWorkflow(root, "answer", {
      key: "audience", value: "Primary school learners", source: "user", evidence: "Client supplied audience"
    }, state.revision);
    assert.equal((await runWorkflow(root, "status")).question.key, "brand");
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("topic preflight requires explicit current acceptance and invalidates edited preview scopes", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-accept-"));
  try {
    await assert.rejects(runWorkflow(root, "preflight"), { code: "DESIGN_NOT_ACCEPTED" });
    await previewFixture(root);
    let s = await agreeBrief(root);
    await assert.rejects(runWorkflow(root, "accept", { fingerprint: s.brief.fingerprint, statement: "Agree" }, s.revision), { code: "INVALID_TRANSITION" });
    s = await runWorkflow(root, "preview", { url: "http://localhost:3100", paths: ["preview.html"] }, s.revision);
    for (const check of QA_CHECKS.filter(c => c !== "contracts")) s = await runWorkflow(root, "qa",
      { check, result: "pass", evidence: `Fixture observed ${check}`, fingerprint: s.preview.fingerprint }, s.revision);
    s = await runWorkflow(root, "review", {}, s.revision);
    await assert.rejects(runWorkflow(root, "preflight"), { code: "DESIGN_NOT_ACCEPTED" });
    await assert.rejects(runWorkflow(root, "accept", { fingerprint: "0".repeat(64), statement: "Agree" }, s.revision), { code: "STALE_REVIEW" });
    s = await runWorkflow(root, "accept", { fingerprint: s.preview.fingerprint, statement: "Test customer explicitly accepts this reviewed preview" }, s.revision);
    assert.equal((await runWorkflow(root, "preflight")).topicReady, true);
    const corrupt = await loadState(root);
    corrupt.qa = [];
    assert.throws(() => assertState(corrupt), { code: "INVALID_STATE" });
    await writeFile(path.join(root, "preview.html"), "new design");
    assert.equal((await runWorkflow(root, "status")).topicReady, false);
    await assert.rejects(runWorkflow(root, "preflight"), { code: "DESIGN_NOT_ACCEPTED" });
    s = await runWorkflow(root, "revise", { target: "brief", note: "Customer changes the audience" }, s.revision);
    assert.equal(s.stage, "interview");
    assert.equal(s.acceptance, null);
    assert.equal(s.brief, null);
    assert.equal(s.next, "brief");
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
