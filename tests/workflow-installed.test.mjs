import { test } from "node:test";
import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, writeFile, readdir, rm, mkdir, symlink } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { install } from "../scripts/install.mjs";
import { QUESTIONS, runWorkflow } from "../skills/explore-ai/scripts/workflow-actions.mjs";
import { QA_CHECKS } from "../skills/explore-ai/scripts/workflow-store.mjs";

test("installed CLI completes an isolated customer journey, detects drift and preserves files on fresh start", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-installed-"));
  try {
    await cp(new URL("../skills/explore-ai/examples/project/", import.meta.url), root, { recursive: true });
    const originalProfile = await readFile(path.join(root, "design/profile.json"));
    const installed = await install(root);
    await cp(new URL("../skills/explore-ai/node_modules/", import.meta.url), path.join(installed, "node_modules"), { recursive: true });
    const script = path.join(installed, "scripts/workflow.mjs");
    let current;
    async function cli(command, input, error) {
      const args = [script, command, "--project", root, "--json"];
      if (input) {
        await writeFile(path.join(root, "input.json"), JSON.stringify(input));
        args.push("--input", "input.json", "--expect", String(current.revision));
      }
      const result = spawnSync(process.execPath, args, { cwd: os.tmpdir(), encoding: "utf8" });
      if (error) {
        assert.equal(result.status, 1);
        assert.equal(JSON.parse(result.stderr).code, error);
      } else {
        assert.equal(result.status, 0, result.stderr);
        current = JSON.parse(result.stdout);
      }
    }
    await cli("start");
    await cli("preflight", null, "DESIGN_NOT_ACCEPTED");
    for (const key of Object.keys(QUESTIONS)) await cli("answer", { key, value: `Fixture ${key}`, source: "user", evidence: "Simulated test input only" });
    await cli("brief", { summary: "Synthetic fixture brief" });
    await cli("agree", { fingerprint: current.brief.fingerprint, statement: "Simulated test brief agreement" });
    await writeFile(path.join(root, "preview.html"), "<!doctype html><h1>Fixture preview</h1>");
    await cli("preview", { url: "http://localhost:3100", paths: ["preview.html"] });
    for (const check of QA_CHECKS.filter(c => c !== "contracts")) await cli("qa", {
      check, result: "pass", evidence: `Simulated ${check} observation for fixture`, fingerprint: current.preview.fingerprint });
    await cli("review", {});
    await cli("accept", { fingerprint: current.preview.fingerprint, statement: "Simulated fixture customer acceptance" });
    await cli("preflight");
    assert.equal(current.topicReady, true);
    await writeFile(path.join(root, "preview.html"), "changed");
    await cli("preflight", null, "DESIGN_NOT_ACCEPTED");
    const oldSession = current.session;
    await cli("restart", { reason: "Test customer requests a fresh interview" });
    assert.notEqual(current.session, oldSession);
    assert.equal(current.question.key, "audience");
    assert.deepEqual(current.decisions, {});
    assert.equal(current.topicReady, false);
    const archived = await readdir(path.join(root, ".explore-ai/history"));
    assert.equal(archived.length, 1);
    assert.equal(JSON.parse(await readFile(path.join(root, ".explore-ai/history", archived[0]), "utf8")).session, oldSession);
    assert.deepEqual(await readFile(path.join(root, "design/profile.json")), originalProfile);
    assert.equal(await readFile(path.join(root, "preview.html"), "utf8"), "changed");
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("workflow state cannot escape through an ancestor junction", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-junction-"));
  try {
    const project = path.join(root, "project"), outside = path.join(root, "outside");
    await mkdir(project); await mkdir(outside);
    await symlink(outside, path.join(project, ".explore-ai"), "junction");
    await assert.rejects(runWorkflow(project, "start"), /escapes root/);
    assert.deepEqual(await readdir(outside), []);
  } finally { await rm(root, { recursive: true, force: true }); }
});
