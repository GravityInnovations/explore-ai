import path from "node:path";
import { readFile, readdir, realpath } from "node:fs/promises";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import { readContract, readJson } from "./contracts.mjs";
import { resolveLocal } from "./paths.mjs";
import { validateDesign } from "./validate.mjs";
import { workflowStatus } from "./workflow-actions.mjs";

export async function inspectProject(project) {
  const root = await realpath(project);
  let config;
  let pkg = {};
  try {
    config = await readContract(
      "project",
      await resolveLocal(root, "explore-ai.config.json", { file: true }),
    );
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  try {
    pkg = await readJson(
      await resolveLocal(root, "package.json", { file: true }),
    );
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const dependencies = { ...pkg.devDependencies, ...pkg.dependencies };
  const candidates = [];
  for (const folder of ["app", "src/app", "styles", "src/styles", "design"]) {
    try {
      const location = await resolveLocal(root, folder);
      const entries = await readdir(location, { withFileTypes: true });
      candidates.push({
        folder,
        entries: entries
          .filter((e) => !e.isSymbolicLink())
          .map((e) => e.name)
          .slice(0, 30),
      });
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  let design = {
    status: "missing",
    path: config?.paths.design ?? "design/profile.json",
  };
  try {
    const file = await resolveLocal(root, design.path, { file: true });
    const raw = await readFile(file);
    const value = JSON.parse(raw.toString("utf8").replace(/^\uFEFF/, ""));
    const errors = validateDesign(value);
    design = {
      ...design,
      status: errors.length ? "invalid" : config ? "valid" : "unconfigured",
      id: value.id,
      sha256: createHash("sha256").update(raw).digest("hex"),
      errors,
    };
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const progress = await workflowStatus(root);
  return {
    root,
    configured: !!config,
    config,
    framework: {
      next: dependencies.next ?? null,
      typescript: dependencies.typescript ?? null,
      three: dependencies.three ?? null,
      gsap: dependencies.gsap ?? null,
    },
    candidates,
    design,
    workflow: { stage: progress.stage, revision: progress.revision, topicReady: progress.topicReady,
      next: progress.next, blockers: progress.blockers, question: progress.question },
    next:
      design.status === "valid" && progress.topicReady
        ? "Reuse design for topic generation"
        : design.status === "unconfigured"
          ? "Preserve the existing profile; adopt its configuration through the guided designer review"
          : `Continue the guided designer workflow: ${progress.next}. A valid profile is not customer acceptance`,
  };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  try {
    if (process.argv.length !== 3)
      throw new Error("Usage: inspect.mjs <project-root>");
    console.log(JSON.stringify(await inspectProject(process.argv[2]), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
