import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, symlink, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { validateData } from "../skills/explain-ai/scripts/contracts.mjs";
import {
  assertRelative,
  resolveLocal,
  lessonIdentity,
} from "../skills/explain-ai/scripts/paths.mjs";

const config = {
  schemaVersion: "1.0.0",
  paths: {
    design: "design/profile.json",
    content: "content",
    assetLibrary: "asset-library",
    publicAssets: "public/explain-ai",
    runtime: "explain-ai.runtime.json",
  },
};
test("versioned project contract rejects unknown properties and malformed versions", () => {
  assert.deepEqual(validateData("project", config), []);
  assert.ok(validateData("project", { ...config, cloud: true }).length);
  assert.ok(
    validateData("project", { ...config, schemaVersion: "2.0.0" }).length,
  );
});
test("catalog identity cannot collide through hyphen concatenation", () => {
  assert.notEqual(
    lessonIdentity("a-b", "c", "d"),
    lessonIdentity("a", "b-c", "d"),
  );
  assert.notEqual(
    lessonIdentity("k1", "science", "plants"),
    lessonIdentity("k2", "science", "plants"),
  );
});
test("portable paths reject traversal, drive paths and device names", () => {
  for (const value of [
    "../secret",
    "/absolute",
    "C:/secret",
    "a\\b",
    "a/../b",
    "a//b",
    "a/CON.txt",
    "a/trailing.",
  ])
    assert.throws(() => assertRelative(value));
});
test("resolver rejects ancestor junction escapes for existing and future files", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "explain-ai-path-"));
  try {
    await mkdir(path.join(root, "project"));
    await mkdir(path.join(root, "outside"));
    await symlink(
      path.join(root, "outside"),
      path.join(root, "project", "linked"),
      "junction",
    );
    await assert.rejects(
      resolveLocal(path.join(root, "project"), "linked/new.json", {
        mustExist: false,
      }),
      /escapes/,
    );
    assert.equal(
      await resolveLocal(path.join(root, "project"), "design/profile.json", {
        mustExist: false,
      }),
      path.join(root, "project", "design", "profile.json"),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
