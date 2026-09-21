import { writeFile } from "node:fs/promises";
import path from "node:path";
import { runWorkflow, QUESTIONS } from "../skills/explore-ai/scripts/workflow-actions.mjs";
import { QA_CHECKS } from "../skills/explore-ai/scripts/workflow-store.mjs";

// Synthetic evidence is exclusively for isolated test projects, never a user acceptance record.
export async function acceptedFixture(root) {
  let s = await runWorkflow(root, "start");
  for (const key of Object.keys(QUESTIONS)) s = await runWorkflow(root, "answer",
    { key, value: `Fixture ${key}`, source: "user", evidence: "Simulated test customer input" }, s.revision);
  s = await runWorkflow(root, "brief", { summary: "Isolated fixture design" }, s.revision);
  s = await runWorkflow(root, "agree", { fingerprint: s.brief.fingerprint, statement: "Simulated test brief agreement" }, s.revision);
  await writeFile(path.join(root, "preview.html"), "<!doctype html><h1>Isolated fixture preview</h1>");
  s = await runWorkflow(root, "preview", { url: "http://localhost:3100", paths: ["preview.html"] }, s.revision);
  for (const check of QA_CHECKS.filter(c => c !== "contracts")) s = await runWorkflow(root, "qa",
    { check, result: "pass", evidence: `Simulated fixture ${check} observation`, fingerprint: s.preview.fingerprint }, s.revision);
  s = await runWorkflow(root, "review", {}, s.revision);
  return runWorkflow(root, "accept", { fingerprint: s.preview.fingerprint, statement: "Simulated test customer acceptance" }, s.revision);
}
