import { test, before } from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import * as THREE from "three";

let audit;
before(async () => {
  const output = path.resolve(".tmp/performance-runtime");
  await mkdir(output, { recursive: true });
  const source = await readFile(new URL("../skills/explore-ai/assets/runtime/performance-audit.ts", import.meta.url), "utf8");
  await writeFile(path.join(output, "performance-audit.mjs"), ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  }).outputText);
  audit = await import(pathToFileURL(path.join(output, "performance-audit.mjs")));
});

test("default performance thresholds flag each exceeded metric and allow explicit reasons", () => {
  for (const key of Object.keys(audit.DEFAULT_PERFORMANCE_BUDGETS)) {
    const metrics = { ...audit.DEFAULT_PERFORMANCE_BUDGETS, [key]: audit.DEFAULT_PERFORMANCE_BUDGETS[key] + 1 };
    const result = audit.auditPerformance(metrics);
    assert.equal(result.valid, false, key);
    assert.match(result.violations[0], new RegExp(key));
    const overridden = audit.auditPerformance(metrics, {}, "Approved complexity for the reviewed lesson");
    assert.equal(overridden.valid, true, key);
    assert.equal(overridden.overridden, true, key);
  }
});

test("scene auditor measures geometry, lights, particles and textures without telemetry", () => {
  const scene = new THREE.Scene();
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial());
  mesh.userData.particleCount = 12;
  mesh.material.map = { image: { width: 1024, height: 512 } };
  scene.add(mesh);
  const light = new THREE.DirectionalLight();
  light.castShadow = true;
  scene.add(light);
  const result = audit.auditScene(scene);
  assert.equal(result.metrics.drawCalls, 1);
  assert.equal(result.metrics.visibleTriangles, 12);
  assert.equal(result.metrics.maxTextureDimension, 1024);
  assert.equal(result.metrics.textureMemoryBytes, 1024 * 512 * 4);
  assert.equal(result.metrics.shadowLights, 1);
  assert.equal(result.metrics.particles, 12);
  assert.equal(result.valid, true);
});

test("resource ledger returns zero owned resources after repeated disposal", () => {
  const ledger = audit.createResourceLedger();
  ledger.own("geometry");
  ledger.own("gsap-context");
  assert.deepEqual(ledger.snapshot(), { geometry: 1, "gsap-context": 1 });
  ledger.release("geometry");
  ledger.dispose();
  ledger.dispose();
  assert.deepEqual(ledger.snapshot(), {});
  assert.throws(() => ledger.own("renderer"), /disposed/);
});
