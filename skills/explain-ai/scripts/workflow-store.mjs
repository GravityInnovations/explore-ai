import { mkdir, open, readFile, rename, unlink, readdir, lstat } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { resolveLocal } from "./paths.mjs";
import { validateData } from "./contracts.mjs";
import { WORKFLOW_CONTRACT_VERSION, workflowMigrationRequiredError } from "./contract-versions.mjs";

export class WorkflowError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}
export function requireThat(condition, code, message) {
  if (!condition) throw new WorkflowError(code, message);
}
export const digest = value => createHash("sha256").update(JSON.stringify(value)).digest("hex");
export const briefDigest = state => digest({ decisions: state.decisions, summary: state.brief.summary });
export const STATE_PATH = ".explain-ai/workflow.json";
export const QA_CHECKS = ["contracts", "desktop", "mobile", "labels", "keyboard", "motion", "fallback", "app-check"];
export const INTERVIEW_KEYS = ["audience", "brand", "typography", "palette", "layout", "visuals", "motion", "accessibility", "constraints"];
export const qaComplete = state => QA_CHECKS.every(check => state.qa.some(q => q.check === check && q.result !== "fail"));

export function newState() {
  return { schemaVersion: WORKFLOW_CONTRACT_VERSION, session: randomUUID(), revision: 0,
    stage: "interview", decisions: {}, pendingChoice: null, candidates: {}, brief: null, preview: null,
    qa: [], feedback: [], acceptance: null };
}

export function assertState(state) {
  const errors = validateData("workflow", state);
  requireThat(!errors.length, "INVALID_STATE", JSON.stringify(errors));
  const ordered = ["interview", "brief-review", "design", "qa", "design-review", "accepted"];
  const stage = ordered.indexOf(state.stage);
  requireThat(stage < 1 || state.brief, "INVALID_STATE", "This stage requires a submitted brief");
  if (state.brief) requireThat(state.brief.fingerprint === briefDigest(state), "INVALID_STATE", "Brief content does not match its fingerprint");
  requireThat(stage < 2 || state.brief?.agreement?.fingerprint === state.brief?.fingerprint,
    "INVALID_STATE", "This stage requires agreement to the current brief");
  requireThat(stage < 3 || state.preview, "INVALID_STATE", "This stage requires a preview");
  requireThat(new Set(state.qa.map(q => q.check)).size === state.qa.length, "INVALID_STATE", "Duplicate QA checks");
  requireThat(state.qa.every(q => q.fingerprint === state.preview?.fingerprint), "INVALID_STATE", "QA belongs to a different preview");
  requireThat(state.qa.every(q => q.result !== "not-applicable" || ["fallback", "app-check"].includes(q.check)), "INVALID_STATE", "Required visual and interaction checks cannot be waived");
  const missing = INTERVIEW_KEYS.filter(key => !state.decisions[key]);
  if (state.pendingChoice) {
    requireThat(missing.includes(state.pendingChoice.key), "INVALID_STATE", "Pending choice must belong to an unresolved decision");
    requireThat(state.pendingChoice.key === missing[0], "INVALID_STATE", "Pending choice must belong to the current decision");
  }
  for (const [key, candidates] of Object.entries(state.candidates)) {
    requireThat(missing.includes(key), "INVALID_STATE", "Candidate context must belong to an unresolved decision");
    requireThat(Array.isArray(candidates) && candidates.length > 0, "INVALID_STATE", "Candidate context cannot be empty");
  }
  if (state.brief) requireThat(!state.pendingChoice && Object.keys(state.candidates).length === 0, "INVALID_STATE", "Brief cannot contain unresolved interactions");
  requireThat(stage < 4 || qaComplete(state), "INVALID_STATE", "Review requires complete QA without blocking failures");
  requireThat(stage === 5 ? state.acceptance?.fingerprint === state.preview?.fingerprint : state.acceptance === null,
    "INVALID_STATE", "Acceptance must match the accepted preview stage");
}

async function localFile(root, relative, mustExist = true) {
  const file = await resolveLocal(root, relative, { mustExist, file: true });
  try { requireThat(!(await lstat(file)).isSymbolicLink(), "UNSAFE_PATH", "Workflow files cannot be symlinks"); }
  catch (e) { if (e.code !== "ENOENT") throw e; }
  return file;
}

export async function loadState(root) {
  try {
    const raw = await readFile(await localFile(root, STATE_PATH), "utf8");
    let state;
    try { state = JSON.parse(raw); } catch { throw new WorkflowError("INVALID_STATE", "Malformed workflow JSON; preserve and repair the record"); }
    if (state?.schemaVersion !== WORKFLOW_CONTRACT_VERSION) {
      const error = workflowMigrationRequiredError(state?.schemaVersion);
      throw new WorkflowError(error.code, error.message);
    }
    assertState(state);
    return state;
  } catch (e) { if (e.code === "ENOENT") return null; throw e; }
}

// Serialize writers and compare revisions under the lock. Never auto-delete another writer's lock.
export async function updateState(root, expected, change) {
  const folder = await resolveLocal(root, ".explain-ai", { mustExist: false });
  await mkdir(folder, { recursive: true });
  const lockPath = await localFile(root, ".explain-ai/workflow.lock", false);
  let lock;
  try { lock = await open(lockPath, "wx"); }
  catch (e) { if (e.code === "EEXIST") throw new WorkflowError("BUSY", "Another workflow write is active; retry status after it finishes"); throw e; }
  const temporary = `.explain-ai/workflow-${randomUUID()}.tmp`;
  let tempPath;
  try {
    const current = await loadState(root);
    requireThat(current ? expected === current.revision : expected === null,
      "STALE_REVISION", "Run status and use its current revision with --expect");
    const result = await change(current);
    result.revision = current ? current.revision + 1 : 0;
    assertState(result);
    tempPath = await localFile(root, temporary, false);
    const handle = await open(tempPath, "wx");
    try { await handle.writeFile(JSON.stringify(result, null, 2) + "\n"); await handle.sync(); }
    finally { await handle.close(); }
    await rename(tempPath, await localFile(root, STATE_PATH, false));
    return result;
  } finally {
    if (tempPath) await unlink(tempPath).catch(e => { if (e.code !== "ENOENT") throw e; });
    await lock.close();
    await unlink(lockPath);
  }
}

// Called under the workflow writer lock; never archive outside the target project.
export async function archiveState(root, state) {
  const folder = await resolveLocal(root, ".explain-ai/history", { mustExist: false });
  await mkdir(folder, { recursive: true });
  const relative = `.explain-ai/history/workflow-${randomUUID()}.json`;
  const handle = await open(await localFile(root, relative, false), "wx");
  try { await handle.writeFile(JSON.stringify(state, null, 2) + "\n"); await handle.sync(); }
  finally { await handle.close(); }
  return relative;
}

const excluded = new Set(["node_modules", ".git", ".agents", ".next", ".explain-ai", ".tmp"]);
// Explicit preview scopes catch edits and added/removed files without hashing dependencies.
export async function snapshot(root, paths) {
  const entries = new Map();
  async function visit(relative) {
    requireThat(!relative.split("/").some(p => excluded.has(p)), "UNSAFE_SCOPE", `Excluded preview scope: ${relative}`);
    const file = await resolveLocal(root, relative);
    const stat = await lstat(file);
    requireThat(!stat.isSymbolicLink(), "UNSAFE_PATH", `Preview symlinks are not supported: ${relative}`);
    if (stat.isDirectory()) {
      for (const child of (await readdir(file)).sort()) {
        if (!excluded.has(child) && !child.endsWith(".tsbuildinfo")) await visit(`${relative}/${child}`);
      }
    } else {
      requireThat(stat.isFile(), "UNSAFE_PATH", `Expected regular preview file: ${relative}`);
      entries.set(relative, createHash("sha256").update(await readFile(file)).digest("hex"));
    }
  }
  for (const relative of paths) await visit(relative);
  requireThat(entries.size > 0, "EMPTY_PREVIEW", "Preview scopes contain no files");
  return digest([...entries].sort(([a], [b]) => a.localeCompare(b)));
}
