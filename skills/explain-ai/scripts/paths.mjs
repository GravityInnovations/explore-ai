import path from "node:path";
import { lstat, realpath } from "node:fs/promises";

export function isWithin(root, child) {
  const rel = path.relative(root, child);
  return (
    rel === "" ||
    (rel !== ".." && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel))
  );
}

export function assertRelative(value) {
  if (
    typeof value !== "string" ||
    !value ||
    value.includes("\\") ||
    path.posix.isAbsolute(value) ||
    value
      .split("/")
      .some(
        (p) =>
          !p ||
          p === "." ||
          p === ".." ||
          /[<>:"|?*\x00-\x1f]/.test(p) ||
          /[ .]$/.test(p) ||
          /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(p),
      )
  )
    throw new Error(`Unsafe project-relative path: ${value}`);
  return value;
}

// Check each existing ancestor, including junctions. Also works for planned outputs.
export async function resolveLocal(
  root,
  relative,
  { mustExist = true, file = false } = {},
) {
  assertRelative(relative);
  const base = await realpath(root);
  let current = base;
  let missing = false;
  for (const part of relative.split("/")) {
    current = path.join(current, part);
    if (missing) continue;
    try {
      await lstat(current);
      if (!isWithin(base, await realpath(current)))
        throw new Error(`Path escapes root: ${relative}`);
    } catch (error) {
      if (error.code !== "ENOENT" || mustExist) throw error;
      missing = true;
    }
  }
  if (file && !missing && !(await lstat(await realpath(current))).isFile())
    throw new Error(`Expected file: ${relative}`);
  return current;
}

export function lessonIdentity(level, subject, topicKey) {
  for (const value of [level, subject, topicKey])
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value))
      throw new Error(`Invalid catalog key: ${value}`);
  return [level, subject, topicKey].join("/");
}

export function lessonRoute(level, subject, slug) {
  for (const value of [level, subject, slug])
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value))
      throw new Error(`Invalid lesson route key: ${value}`);
  return [level, subject, slug].join("/");
}

export function assertLessonRoute(route) {
  if (typeof route !== "string" || !route || route === "/" || route.startsWith("/"))
    throw new Error("Lessons must use a nested level/subject/slug route; the root route belongs to the project catalog");
  return route;
}
