import path from "node:path";
import { mkdir, readFile, readdir, realpath, rename, rm, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { readContract, validateData } from "./contracts.mjs";
import { lessonIdentity, lessonRoute, resolveLocal } from "./paths.mjs";

async function collectLessons(root, relative) {
  const directory = await resolveLocal(root, relative, { file: false });
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const child = `${relative}/${entry.name}`;
    if (entry.isSymbolicLink()) throw new Error(`Linked catalog entries are not supported: ${child}`);
    if (entry.isDirectory()) files.push(...(await collectLessons(root, child)));
    else if (entry.name === "lesson.json") files.push(child);
  }
  return files.sort();
}

async function atomicWrite(file, value) {
  const temporary = `${file}.explore-ai-catalog.tmp`;
  await rm(temporary, { force: true });
  try {
    await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
    await rename(temporary, file);
  } finally {
    await rm(temporary, { force: true });
  }
}

export async function buildCatalog(project, { write = false } = {}) {
  const root = await realpath(project);
  const config = await readContract("project", await resolveLocal(root, "explore-ai.config.json", { file: true }), { project: root });
  const entries = [];
  for (const relative of await collectLessons(root, config.paths.content)) {
    const lesson = await readContract("lesson", await resolveLocal(root, relative, { file: true }), { project: root });
    entries.push({
      level: lesson.level,
      subject: lesson.subject,
      topicKey: lesson.topicKey,
      slug: lesson.slug,
      lessonId: lessonIdentity(lesson.level, lesson.subject, lesson.topicKey),
      route: lessonRoute(lesson.level, lesson.subject, lesson.slug),
      title: lesson.title,
    });
  }
  entries.sort((a, b) => a.route.localeCompare(b.route));
  const routes = new Set();
  for (const entry of entries) {
    if (routes.has(entry.route)) throw new Error(`Catalog route collision: ${entry.route}`);
    routes.add(entry.route);
  }
  const catalog = { schemaVersion: "2.0.0", entries };
  const errors = validateData("catalog", catalog, { project: root });
  if (errors.length) throw new Error(errors.map((error) => `${error.path}: ${error.message}`).join("; "));
  const output = await resolveLocal(root, config.paths.catalog, { mustExist: false });
  if (write) {
    await mkdir(path.dirname(output), { recursive: true });
    await atomicWrite(output, catalog);
  }
  return { mode: write ? "write" : "plan", status: write ? "written" : "planned", path: config.paths.catalog, entries };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2);
    let project;
    let write = false;
    for (let index = 0; index < args.length; index++) {
      if (args[index] === "--write") write = true;
      else if (args[index] === "--project" && args[index + 1] && !args[index + 1].startsWith("--")) project = args[++index];
      else throw new Error(`Invalid argument: ${args[index]}`);
    }
    if (!project) throw new Error("Usage: build-catalog.mjs --project <root> [--write]");
    console.log(JSON.stringify(await buildCatalog(project, { write }), null, 2));
  } catch (error) {
    console.error(JSON.stringify({ valid: false, error: error.message }));
    process.exitCode = 1;
  }
}
