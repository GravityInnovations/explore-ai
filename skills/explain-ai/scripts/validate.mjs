import path from "node:path";
import { readdir, readFile, realpath } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { readContract, validateData } from "./contracts.mjs";
import { resolveLocal, lessonIdentity } from "./paths.mjs";
import { workflowStatus } from "./workflow-actions.mjs";

const emphasis = new Set([
  "focus",
  "highlight",
  "isolate",
  "extract",
  "inspect",
  "magnify",
  "compare",
]);
const under = (id, parent) => id === parent || id.startsWith(`${parent}.`);
export function validateSemantics(lesson, design, index, runtime) {
  const errors = [];
  const add = (p, message) => errors.push({ path: p, message });
  for (const [kind, data] of [
    ["lesson", lesson],
    ["design", design],
    ["asset-index", index],
    ["runtime", runtime],
  ]) {
    const invalid = validateData(kind, data);
    if (invalid.length)
      return invalid.map((e) => ({ ...e, path: `/${kind}${e.path}` }));
  }
  const unique = (items, p) => {
    const result = new Map();
    items.forEach((item, i) => {
      if (result.has(item.id)) add(`${p}/${i}/id`, `Duplicate ID: ${item.id}`);
      result.set(item.id, item);
    });
    return result;
  };
  const objects = unique(lesson.objects, "/objects");
  unique(lesson.steps, "/steps");
  const components = unique(runtime.components, "/runtime/components");
  const assets = unique([...index.assets, ...(lesson.assets ?? [])], "/assets");
  if (
    lesson.lessonId !==
    lessonIdentity(lesson.level, lesson.subject, lesson.topicKey)
  )
    add("/lessonId", "Must equal level/subject/topicKey");
  if (lesson.designId !== design.id)
    add("/designId", "Must inherit the project design ID");
  const target = (id, p) => {
    if (!objects.has(id)) add(p, `Unknown semantic target: ${id}`);
  };
  const asset = (id, p, type) => {
    const a = assets.get(id);
    if (!a) add(p, `Unknown asset: ${id}`);
    else if (type && a.type !== type) add(p, `Expected ${type} asset`);
  };
  lesson.objects.forEach((o, i) => {
    const p = `/objects/${i}`;
    if (!components.has(o.component))
      add(`${p}/component`, `Unsupported component: ${o.component}`);
    const expected = o.id.includes(".")
      ? o.id.slice(0, o.id.lastIndexOf("."))
      : undefined;
    if (o.parent !== expected)
      add(
        `${p}/parent`,
        "Parent must match the immediate semantic path prefix",
      );
    if (o.parent) target(o.parent, `${p}/parent`);
    if (o.assetId) asset(o.assetId, `${p}/assetId`);
    if (o.material && !Object.hasOwn(design.materials, o.material))
      add(`${p}/material`, "Unknown inherited material");
    const seen = new Set([o.id]);
    let ancestor = o.parent;
    while (ancestor && objects.has(ancestor)) {
      if (seen.has(ancestor)) {
        add(`${p}/parent`, "Cyclic hierarchy");
        break;
      }
      seen.add(ancestor);
      ancestor = objects.get(ancestor).parent;
    }
  });
  if (lesson.accessibility.staticDiagramAssetId)
    asset(
      lesson.accessibility.staticDiagramAssetId,
      "/accessibility/staticDiagramAssetId",
      "image",
    );
  lesson.steps.forEach((step, i) => {
    const p = `/steps/${i}`;
    const focused = new Set();
    const hidden = new Set();
    const opacity = new Map(
      [...objects.values()].map((o) => [
        o.id,
        o.material ? (design.materials[o.material]?.opacity ?? 1) : 1,
      ]),
    );
    target(step.camera.target, `${p}/camera/target`);
    if (!runtime.cameraModes.includes(step.camera.mode))
      add(`${p}/camera/mode`, `Unsupported camera: ${step.camera.mode}`);
    if (step.camera.mode !== "wide") focused.add(step.camera.target);
    if (step.narrationAssetId)
      asset(step.narrationAssetId, `${p}/narrationAssetId`, "audio");
    step.actions.forEach((a, j) => {
      const q = `${p}/actions/${j}`;
      target(a.target, `${q}/target`);
      if (!runtime.actions.includes(a.action))
        add(`${q}/action`, `Runtime does not support ${a.action}`);
      const object = objects.get(a.target);
      if (
        object &&
        !components.get(object.component)?.actions.includes(a.action)
      )
        add(q, `Component ${object.component} does not support ${a.action}`);
      if (emphasis.has(a.action)) focused.add(a.target);
      if (a.action === "compare") {
        target(a.with, `${q}/with`);
        focused.add(a.with);
        if (a.with === a.target)
          add(q, "Comparison requires two distinct targets");
      }
      if (a.action === "flow") {
        target(a.to, `${q}/to`);
        if (a.to === a.target) add(q, "Flow requires distinct endpoints");
      }
      if (a.action === "dissect")
        a.parts.forEach((id, k) => {
          target(id, `${q}/parts/${k}`);
          if (id === a.target || !under(id, a.target))
            add(q, "Dissected parts must be descendants of the target");
        });
      if (a.action === "follow")
        a.path.forEach((id, k) => target(id, `${q}/path/${k}`));
      if (
        a.action === "cutaway" &&
        Object.values(a.normal).every((n) => n === 0)
      )
        add(`${q}/normal`, "Cutting-plane normal cannot be zero");
      if (a.action === "isolate")
        for (const id of objects.keys())
          if (!under(id, a.target) && !under(a.target, id)) hidden.add(id);
      if (a.action === "hide") hidden.add(a.target);
      if (a.action === "fade")
        for (const id of objects.keys())
          if (under(id, a.target)) opacity.set(id, a.opacity);
      // Xray affects outer surfaces, not the visibility of interior descendants.
      if (a.action === "xray") opacity.set(a.target, a.opacity);
      if (a.action === "assemble")
        for (const id of objects.keys())
          if (under(id, a.target)) {
            const object = objects.get(id);
            opacity.set(
              id,
              object.material
                ? (design.materials[object.material]?.opacity ?? 1)
                : 1,
            );
            hidden.delete(id);
          }
      if (a.action === "reveal")
        for (const id of [...hidden])
          if (under(id, a.target)) hidden.delete(id);
    });
    step.explains.forEach((id, j) => {
      target(id, `${p}/explains/${j}`);
      if (!focused.has(id))
        add(
          `${p}/explains/${j}`,
          `Explained target needs explicit emphasis or a close camera: ${id}`,
        );
      if (
        [...hidden].some((parent) => under(id, parent)) ||
        opacity.get(id) === 0
      )
        add(`${p}/explains/${j}`, `Explained target is hidden: ${id}`);
    });
  });
  return errors;
}

export function critiqueEmphasis(lesson, runtime) {
  const warnings = [];
  const alternatives = new Set([
    "focus", "isolate", "extract", "explode", "xray", "magnify", "compare", "flow",
  ]);
  const hasAlternative = [...alternatives].some((action) => runtime.actions.includes(action));
  let run = [];
  const report = () => {
    if (run.length >= 3)
      warnings.push({
        path: `/steps/${run[0]}/actions`,
        code: "EMPHASIS_REPETITION",
        message: `${run.length} consecutive teaching steps use highlight only; consider a compatible registered technique such as focus, isolate, extract, magnify, compare or flow`,
      });
  };
  lesson.steps.forEach((step, index) => {
    const teaching = step.explains.length > 0;
    const highlightOnly = teaching && step.actions.length > 0 && step.actions.every((action) => action.action === "highlight");
    if (hasAlternative && highlightOnly) run.push(index);
    else {
      report();
      run = [];
    }
  });
  report();
  return warnings;
}

export function critiqueCopy(lesson) {
  return lesson.steps.flatMap((step, index) => {
    const text = step.text.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const sentences = text ? (text.match(/[.!?]+(?=\s|$)/g) ?? []).length : 0;
    if (words <= 65 && sentences <= 3) return [];
    return [{
      path: `/steps/${index}/text`,
      code: "COPY_DENSITY",
      message: `Step copy is dense (${words} words, ${sentences} sentences); keep one teaching point with short progressive blocks`,
    }];
  });
}

function luminance(hex) {
  const channels = hex
    .slice(1)
    .match(/../g)
    .map((v) => parseInt(v, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
export function validateDesign(design) {
  const errors = validateData("design", design);
  if (errors.length) return errors;
  const [a, b] = [
    luminance(design.colors.text),
    luminance(design.colors.background),
  ].sort((x, y) => y - x);
  if ((a + 0.05) / (b + 0.05) < design.accessibility.minimumContrast)
    errors.push({
      path: "/colors",
      message: "Text/background contrast is below the profile minimum",
    });
  return errors;
}

export async function loadProject(root) {
  root = await realpath(root);
  const config = await readContract(
    "project",
    await resolveLocal(root, "explain-ai.config.json", { file: true }),
    { project: root },
  );
  for (const relative of Object.values(config.paths))
    await resolveLocal(root, relative, { mustExist: false });
  const design = await readContract(
    "design",
    await resolveLocal(root, config.paths.design, { file: true }),
    { project: root },
  );
  const designErrors = validateDesign(design);
  if (designErrors.length)
    throw new Error(
      designErrors.map((e) => `${e.path}: ${e.message}`).join("; "),
    );
  const index = await readContract(
    "asset-index",
    await resolveLocal(root, `${config.paths.assetLibrary}/index.json`, {
      file: true,
    }),
    { project: root },
  );
  const runtime = await readContract(
    "runtime",
    await resolveLocal(root, config.paths.runtime, { file: true }),
    { project: root },
  );
  return { root, config, design, index, runtime };
}

async function collectLessons(root, relative) {
  const directory = await resolveLocal(root, relative);
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink())
      throw new Error(
        `Linked catalog entries are not supported: ${relative}/${entry.name}`,
      );
    if (entry.isDirectory())
      files.push(...(await collectLessons(root, `${relative}/${entry.name}`)));
    else if (entry.name === "lesson.json")
      files.push(`${relative}/${entry.name}`);
  }
  return files;
}

export async function validateProject(
  project,
  { lesson: requested, integrated = false } = {},
) {
  if (integrated || requested) {
    const progress = await workflowStatus(project);
    if (!progress.topicReady) return { valid: false, lessons: 0, integrated,
      errors: [{ path: "/.explain-ai/workflow.json", code: "DESIGN_NOT_ACCEPTED", message: progress.blockers.join("; ") }] };
  }
  const { root, config, design, index, runtime } = await loadProject(project);
  const errors = [];
  const warnings = [];
  const add = (p, message) => errors.push({ path: p, message });
  const lessons = requested
    ? [requested]
    : await collectLessons(root, config.paths.content);
  const routes = new Set();
  const ids = new Set();
  if (!lessons.length) add("/content", "No lessons found");
  async function checkAsset(a, base, publicRelative, p) {
    try {
      const source = await resolveLocal(root, `${base}/${a.path}`, {
        file: true,
      });
      // Component source belongs in the bundle, never in public assets.
      if (integrated && a.type !== "component") {
        const published = await resolveLocal(
          root,
          `${config.paths.publicAssets}/${publicRelative}/${a.path}`,
          { file: true },
        );
        if (!(await readFile(source)).equals(await readFile(published)))
          add(p, "Browser asset copy differs from source");
      }
    } catch (error) {
      add(p, error.message);
    }
  }
  for (const a of index.assets)
    await checkAsset(
      a,
      config.paths.assetLibrary,
      "library",
      `/asset-library/${a.id}`,
    );
  for (const relative of lessons) {
    try {
      const lesson = await readContract(
        "lesson",
        await resolveLocal(root, relative, { file: true }),
        { project: root },
      );
      const expected = `${config.paths.content}/${lessonIdentity(lesson.level, lesson.subject, lesson.topicKey)}/lesson.json`;
      if (relative !== expected)
        add(relative, `Expected catalog path: ${expected}`);
      const route = `${lesson.level}/${lesson.subject}/${lesson.slug}`;
      if (routes.has(route)) add(relative, `Duplicate route: ${route}`);
      routes.add(route);
      if (ids.has(lesson.lessonId))
        add(relative, `Duplicate lesson ID: ${lesson.lessonId}`);
      ids.add(lesson.lessonId);
      errors.push(
        ...validateSemantics(lesson, design, index, runtime).map((e) => ({
          ...e,
          path: `${relative}${e.path}`,
        })),
      );
      warnings.push(
        ...critiqueEmphasis(lesson, runtime).map((warning) => ({
          ...warning,
          path: `${relative}${warning.path}`,
        })),
      );
      warnings.push(
        ...critiqueCopy(lesson).map((warning) => ({
          ...warning,
          path: `${relative}${warning.path}`,
        })),
      );
      const base = path.posix.dirname(relative);
      for (const a of lesson.assets ?? []) {
        if (!a.path.startsWith("assets/"))
          add(
            `${relative}/assets/${a.id}`,
            "Lesson asset paths must start with assets/",
          );
        await checkAsset(
          a,
          base,
          `lessons/${lesson.lessonId}`,
          `${relative}/assets/${a.id}`,
        );
      }
    } catch (error) {
      add(relative, error.message);
    }
  }
  return {
    valid: errors.length === 0,
    lessons: lessons.length,
    errors,
    warnings,
    integrated,
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  try {
    const args = process.argv.slice(2);
    const options = {};
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === "--integrated") options.integrated = true;
      else if (
        ["--project", "--lesson", "--kind", "--file"].includes(arg) &&
        args[i + 1] &&
        !args[i + 1].startsWith("--")
      )
        options[arg.slice(2)] = args[++i];
      else throw new Error(`Invalid argument: ${arg}`);
    }
    let result;
    if (options.kind && options.file && !options.project) {
      const value = await readContract(options.kind, options.file);
      const errors = options.kind === "design" ? validateDesign(value) : [];
      result = { valid: errors.length === 0, errors };
    } else if (options.project && !options.kind && !options.file)
      result = await validateProject(options.project, options);
    else
      throw new Error(
        "Usage: validate.mjs --project <root> [--lesson <relative-path>] [--integrated] OR --kind <contract> --file <json>",
      );
    console.log(JSON.stringify(result, null, 2));
    if (!result.valid) process.exitCode = 1;
  } catch (error) {
    console.error(
      JSON.stringify({
        valid: false,
        errors: [{ path: "/", message: error.message }],
      }),
    );
    process.exitCode = 1;
  }
}
