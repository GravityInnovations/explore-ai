import { readFile, readdir, lstat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const skill = path.join(root, "skills/explain-ai");
const required = [
  "SKILL.md",
  "agents/openai.yaml",
  "LICENSE",
  "package.json",
  "package-lock.json",
  "scripts/validate.mjs",
  "scripts/inspect.mjs",
  "scripts/find-assets.mjs",
];
for (const name of required)
  if (!(await lstat(path.join(skill, name))).isFile())
    throw new Error(`Missing installed file: ${name}`);
if (
  !(await readFile(path.join(root, "LICENSE"))).equals(
    await readFile(path.join(skill, "LICENSE")),
  )
)
  throw new Error("Installed MIT license differs");
const entry = await readFile(path.join(skill, "SKILL.md"), "utf8");
if (!/^---\r?\nname: explain-ai\r?\ndescription: .+\r?\n---/.test(entry))
  throw new Error("Invalid skill frontmatter");
const dependencies = JSON.parse(
  await readFile(path.join(skill, "package.json"), "utf8"),
);
if (!dependencies.dependencies?.ajv)
  throw new Error("Installed validator dependency missing");
async function walk(directory) {
  let files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (["node_modules", ".git", ".tmp"].includes(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Package symlink: ${file}`);
    if (entry.isDirectory()) files.push(...(await walk(file)));
    else files.push(file);
  }
  return files;
}
const files = await walk(skill);
for (const file of [
  ...files.filter((f) => f.endsWith(".md")),
  path.join(root, "README.md"),
  path.join(root, "INSTALL.md"),
]) {
  const content = await readFile(file, "utf8");
  for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].split("#")[0];
    if (!target || /^[a-z]+:/i.test(target) || target.startsWith("/")) continue;
    const resolved = path.resolve(path.dirname(file), target);
    if (
      file.startsWith(skill + path.sep) &&
      !resolved.startsWith(skill + path.sep)
    )
      throw new Error(
        `Installed reference escapes the package: ${file} -> ${target}`,
      );
    await lstat(resolved);
  }
}
const lesson = JSON.parse(
  await readFile(path.join(skill, "schemas/lesson.schema.json"), "utf8"),
);
const common = JSON.parse(
  await readFile(path.join(skill, "schemas/common.schema.json"), "utf8"),
);
const actions = lesson.$defs.action.oneOf
  .map((v) => v.$ref.split("/").at(-1))
  .sort();
if (
  JSON.stringify(actions) !==
  JSON.stringify([...common.$defs.actionName.enum].sort())
)
  throw new Error("Action vocabulary drift");
const spec = await readFile(
  path.join(skill, "references/LESSON-SPEC.md"),
  "utf8",
);
for (const action of actions)
  if (!spec.includes(`| ${action} |`))
    throw new Error(`Missing action documentation: ${action}`);
console.log(
  `Package checks passed: ${files.length} files, ${actions.length} documented actions, matching MIT license and valid local links`,
);
