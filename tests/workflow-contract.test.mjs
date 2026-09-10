import { test } from "node:test";
import assert from "node:assert/strict";
import { validateData } from "../skills/explain-ai/scripts/contracts.mjs";

export function draftState() {
  return { schemaVersion: "1.0.0", session: "fixture", revision: 0,
    stage: "interview", decisions: {}, brief: null, preview: null,
    qa: [], feedback: [], acceptance: null };
}

test("workflow contracts reject unknown stages, decisions and evidence shapes", () => {
  assert.deepEqual(validateData("workflow", draftState()), []);
  for (const change of [
    { stage: "ready" }, { revision: -1 }, { force: true },
    { decisions: { audience: { value: "Everyone", source: "assumed", evidence: "guess" } } },
    { decisions: { logo: { value: "A", source: "user", evidence: "A" } } },
    { acceptance: { fingerprint: "not-a-hash", statement: "", at: "today" } },
  ]) assert.ok(validateData("workflow", { ...draftState(), ...change }).length);
});
