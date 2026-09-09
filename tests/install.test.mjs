import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  readFile,
  rm,
  access,
  mkdir,
  symlink,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { install } from "../scripts/install.mjs";

test("installation is self-contained, excludes dependencies and refuses replacement", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "explain-ai-install-"));
  try {
    const installed = await install(root);
    assert.match(
      await readFile(path.join(installed, "SKILL.md"), "utf8"),
      /name: explain-ai/,
    );
    assert.match(
      await readFile(path.join(installed, "package-lock.json"), "utf8"),
      /ajv/,
    );
    assert.equal(
      await readFile(path.join(installed, "LICENSE"), "utf8"),
      await readFile(new URL("../LICENSE", import.meta.url), "utf8"),
    );
    await assert.rejects(access(path.join(installed, "node_modules")));
    await assert.rejects(install(root), { code: "EEXIST" });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("installer rejects a linked destination escaping the project", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "explain-ai-link-"));
  try {
    const project = path.join(root, "project");
    const outside = path.join(root, "outside");
    await mkdir(project);
    await mkdir(outside);
    await symlink(outside, path.join(project, ".agents"), "junction");
    await assert.rejects(install(project), /escapes/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
