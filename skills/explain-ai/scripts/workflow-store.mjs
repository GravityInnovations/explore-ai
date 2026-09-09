import { mkdir, open, readFile, rename, unlink, readdir, lstat } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
import { resolveLocal } from "./paths.mjs";
import { validateData } from "./contracts.mjs";

export class WorkflowError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}
export function requireThat(condition, code, message) {
  if (!condition) throw new WorkflowError(code, message);
}
export const digest = value => createHash("sha256").update(JSON.stringify(value)).digest("hex");
export const briefDigest = state => digest({ decisions: state.decisions, summary: state.brief.summary });
export const STATE_PATH = ".explain-ai/workflow.json";

export function newState() {
  return { schemaVersion: "1.0.0", session: randomUUID(), revision: 0,
    stage: "interview", decisions: {}, brief: null, preview: null,
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
