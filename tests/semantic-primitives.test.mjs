import { test, before } from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import * as THREE from "three";

let primitives;
let registry;
before(async () => {
  const output = path.resolve(".tmp/semantic-runtime");
  await mkdir(output, { recursive: true });
  for (const name of ["semantic-primitives", "capability-registry"]) {
    let source = await readFile(new URL(`../skills/explain-ai/assets/runtime/${name}.ts`, import.meta.url), "utf8");
    source = source.replaceAll('"./semantic-primitives"', '"./semantic-primitives.mjs"');
    await writeFile(path.join(output, `${name}.mjs`), ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
    }).outputText);
  }
  primitives = await import(pathToFileURL(path.join(output, "semantic-primitives.mjs")));
  registry = await import(pathToFileURL(path.join(output, "capability-registry.mjs")));
});

function scene() {
  const root = new THREE.Group();
  const child = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ opacity: 1 }));
  child.name = "child";
  child.position.x = 1;
  root.add(child);
  return { root, child, targets: new Map([["part", root], ["part.child", child]]) };
}

test("registry exposes reusable generic handlers and explicit geometry extension boundary", () => {
  const s = scene();
  const handlers = primitives.createSemanticPrimitives({ targets: s.targets, baseline: primitives.captureBaseline(s.targets) });
  assert.deepEqual([...handlers.keys()].sort(), ["compare", "explode", "extract", "flow", "focus", "highlight", "isolate", "magnify", "orbit", "xray"]);
  assert.equal(handlers.has("dissect"), false);
  assert.equal(handlers.has("cutaway"), false);
});

test("all generic handlers sample from baseline and restore deterministically", () => {
  const s = scene();
  const context = { targets: s.targets, baseline: primitives.captureBaseline(s.targets) };
  const handlers = primitives.createSemanticPrimitives(context);
  const actions = [
    ["focus", { action: "focus", target: "part" }],
    ["highlight", { action: "highlight", target: "part" }],
    ["isolate", { action: "isolate", target: "part.child" }],
    ["extract", { action: "extract", target: "part", offset: { x: 2, y: 0, z: 0 } }],
    ["explode", { action: "explode", target: "part", distance: 2 }],
    ["xray", { action: "xray", target: "part", opacity: 0.2 }],
    ["magnify", { action: "magnify", target: "part", factor: 2 }],
    ["orbit", { action: "orbit", target: "part", degrees: 90 }],
    ["compare", { action: "compare", target: "part", with: "part.child" }],
    ["flow", { action: "flow", target: "part.child", to: "part" }],
  ];
  const baseline = primitives.captureBaseline(s.targets);
  for (const [name, action] of actions) {
    const handler = handlers.get(name);
    handler(action, 0.5);
    handler(action, 1);
    handler(action, 0.8);
    handler(action, 0.2);
    primitives.restoreBaseline(baseline);
    assert.deepEqual(s.root.position.toArray(), [0, 0, 0], `${name} root position`);
    assert.deepEqual(s.child.position.toArray(), [1, 0, 0], `${name} child position`);
    assert.equal(s.root.visible, true, `${name} root visibility`);
    assert.equal(s.child.visible, true, `${name} child visibility`);
  }
});

test("the same registry works with an unrelated scene", () => {
  const root = new THREE.Group();
  const target = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshBasicMaterial());
  const destination = new THREE.Mesh(new THREE.ConeGeometry(1, 2), new THREE.MeshBasicMaterial());
  destination.position.x = 3;
  root.add(target, destination);
  const targets = new Map([["planet", target], ["destination", destination]]);
  const context = { targets, baseline: primitives.captureBaseline(targets) };
  const handlers = primitives.createSemanticPrimitives(context);
  handlers.get("extract")({ action: "extract", target: "planet", offset: { x: 1, y: 0, z: 0 } }, 1);
  assert.equal(target.position.x, 1);
  primitives.restoreBaseline(context.baseline);
  handlers.get("flow")({ action: "flow", target: "planet", to: "destination" }, 0.5);
  assert.equal(target.position.x, 1.5);
});

test("handlers fail closed for missing targets and manifests cannot advertise unusable actions", () => {
  const s = scene();
  const context = { targets: s.targets, baseline: primitives.captureBaseline(s.targets) };
  const handlers = primitives.createSemanticPrimitives(context);
  assert.throws(() => handlers.get("focus")({ action: "focus", target: "missing" }, 0.5), /Missing semantic target/);
  assert.throws(() => registry.assertCapabilityManifest({ actions: ["dissect"], components: [] }, handlers), /without handler/);
  assert.throws(() => registry.assertCapabilityManifest({ actions: ["focus"], components: [{ id: "box", actions: ["focus"] }] }, handlers, new Map()), /unusable/);
  assert.equal(registry.assertCapabilityManifest({ actions: ["focus"], components: [] }, handlers), true);
});
