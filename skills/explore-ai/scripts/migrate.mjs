import path from "node:path";
import {
  mkdir,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { readJson, validateData } from "./contracts.mjs";
import { DATA_CONTRACT_VERSION, migrationCommand } from "./contract-versions.mjs";
import { assertRelative, resolveLocal } from "./paths.mjs";
import {
  fromVersion,
  migrateContract,
  migrationId,
  toVersion,
} from "./migrations/1.0.0-to-2.0.0.mjs";
import { validateProject } from "./validate.mjs";

const backupRelative = `.explore-ai/migrations/${migrationId}/backup`;

async function collectLessons(root, relative) {
  const directory = await resolveLocal(root, relative, { file: false });
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const child = `${relative}/${entry.name}`;
    if (entry.isSymbolicLink())
      throw new Error(`Linked catalog entries are not supported: ${child}`);
    if (entry.isDirectory()) files.push(...(await collectLessons(root, child)));
    else if (entry.name === "lesson.json") files.push(child);
  }
  return files;
}

async function ownedContracts(root) {
  const configRelative = "explore-ai.config.json";
  const rawConfig = await readJson(await resolveLocal(root, configRelative, { file: true }));
  const config =
    rawConfig.schemaVersion === fromVersion
      ? migrateContract("project", rawConfig)
      : rawConfig;
  const configErrors = validateData("project", config, { project: root });
  if (configErrors.length)
    throw new Error(configErrors.map((error) => `${error.path}: ${error.message}`).join("; "));
  for (const relative of Object.values(config.paths)) assertRelative(relative);
  const entries = [
    ["project", configRelative],
    ["design", config.paths.design],
    ["asset-index", `${config.paths.assetLibrary}/index.json`],
    ["runtime", config.paths.runtime],
    ...(await collectLessons(root, config.paths.content)).map((file) => ["lesson", file]),
  ];
  return entries.sort((a, b) => a[1].localeCompare(b[1]));
}

function outputBytes(value) {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
}

async function atomicWrite(file, bytes) {
      const temporary = path.join(path.dirname(file), `.${path.basename(file)}.explore-ai-migrate.tmp`);
  await rm(temporary, { force: true });
  try {
    await writeFile(temporary, bytes, { flag: "wx" });
    await rename(temporary, file);
  } finally {
    await rm(temporary, { force: true });
  }
}

async function existingFiles(root, relative = "") {
  const folder = relative ? path.join(root, relative) : root;
  const files = [];
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const child = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...(await existingFiles(root, child)));
    else files.push(child);
  }
  return files.sort();
}

async function prepareBackup(root, changes) {
  const backupRoot = await resolveLocal(root, backupRelative, { mustExist: false });
  let exists = false;
  try {
    exists = (await stat(backupRoot)).isDirectory();
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (exists) {
    const actual = await existingFiles(backupRoot);
    const expected = changes.map(({ relative }) => relative).sort();
    if (JSON.stringify(actual) !== JSON.stringify(expected))
      throw new Error(`Backup collision at ${backupRelative}: file set differs`);
    for (const change of changes) {
      const backup = await readFile(path.join(backupRoot, change.relative));
      if (!backup.equals(change.before))
        throw new Error(`Backup collision at ${backupRelative}/${change.relative}: bytes differ`);
    }
    return backupRoot;
  }
  for (const change of changes) {
    const target = path.join(backupRoot, change.relative);
    await mkdir(path.dirname(target), { recursive: true });
    await atomicWrite(target, change.before);
  }
  return backupRoot;
}

export async function migrateProject(project, { write = false } = {}) {
  const root = await realpath(project);
  const entries = await ownedContracts(root);
  const changes = [];
  for (const [kind, relative] of entries) {
    const file = await resolveLocal(root, relative, { file: true });
    const before = await readFile(file);
    const value = JSON.parse(before.toString("utf8").replace(/^\uFEFF/, ""));
    if (value.schemaVersion === DATA_CONTRACT_VERSION) {
      const errors = validateData(kind, value, { project: root });
      if (errors.length) throw new Error(`${relative}: ${errors.map((e) => `${e.path} ${e.message}`).join("; ")}`);
      continue;
    }
    if (value.schemaVersion !== fromVersion)
      throw new Error(
        `${relative}: unsupported schemaVersion ${JSON.stringify(value.schemaVersion)}. Migration required, but no migration is available; current command: ${migrationCommand(root)}`,
      );
    const migrated = migrateContract(kind, value);
    const errors = validateData(kind, migrated, { project: root });
    if (errors.length)
      throw new Error(`${relative}: migrated output is invalid: ${errors.map((e) => `${e.path} ${e.message}`).join("; ")}`);
    changes.push({ kind, relative, before, after: outputBytes(migrated) });
  }
  const result = {
    migration: migrationId,
    from: fromVersion,
    to: toVersion,
    mode: write ? "write" : "plan",
    status: changes.length ? (write ? "migrated" : "planned") : "already-migrated",
    backup: backupRelative,
    files: changes.map(({ kind, relative }) => ({ kind, path: relative, action: "update" })),
  };
  if (!write || !changes.length) return result;
  await prepareBackup(root, changes);
  for (const change of changes)
    await atomicWrite(path.join(root, change.relative), change.after);
  const validation = await validateProject(root);
  if (!validation.valid)
    throw new Error(`Migrated project is invalid: ${validation.errors.map((e) => `${e.path} ${e.message}`).join("; ")}`);
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2);
    let project;
    let write = false;
    for (let index = 0; index < args.length; index++) {
      if (args[index] === "--write") write = true;
      else if (args[index] === "--project" && args[index + 1] && !args[index + 1].startsWith("--"))
        project = args[++index];
      else throw new Error(`Invalid argument: ${args[index]}`);
    }
    if (!project) throw new Error("Usage: migrate.mjs --project <root> [--write]");
    console.log(JSON.stringify(await migrateProject(project, { write }), null, 2));
  } catch (error) {
    console.error(JSON.stringify({ migrated: false, error: error.message }));
    process.exitCode = 1;
  }
}
