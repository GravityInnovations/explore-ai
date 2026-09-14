import { test } from "node:test";
import assert from "node:assert/strict";
import ts from "typescript";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

test("desktop lesson gate has a fixed inclusive 768px boundary", async () => {
  const source = await readFile(new URL("../skills/explain-ai/assets/templates/DesktopLessonGate.tsx", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const file = path.resolve(".tmp/DesktopLessonGate.mjs");
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, compiled);
  const gate = await import(pathToFileURL(file));
  assert.equal(gate.isDesktopLessonWidth(767), false);
  assert.equal(gate.isDesktopLessonWidth(768), true);
  assert.equal(gate.isDesktopLessonWidth(1280), true);
  assert.equal(gate.isDesktopLessonWidth(Number.NaN), false);
});
