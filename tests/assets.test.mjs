import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { findAssets } from "../skills/explore-ai/scripts/find-assets.mjs";
import { validateSemantics } from "../skills/explore-ai/scripts/validate.mjs";
import { validateData } from "../skills/explore-ai/scripts/contracts.mjs";
import { fixture } from "./fixtures.mjs";
test("asset search reuses indexed local files and narrows by all query terms", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "explore-ai-assets-"));
  try {
    const f = fixture();
    await writeFile(
      path.join(root, "explore-ai.config.json"),
      JSON.stringify(f.config),
    );
    await mkdir(path.join(root, "asset-library"));
    f.index.assets = [
      {
        id: "shape-diagram",
        type: "image",
        path: "diagram.svg",
        tags: ["shape", "maths"],
        description: "A labelled diagram",
        license: "MIT",
        source: "original fixture",
        provenanceStatus: "original",
        redistribution: "allowed",
      },
    ];
    await writeFile(
      path.join(root, "asset-library/index.json"),
      JSON.stringify(f.index),
    );
    await writeFile(path.join(root, "asset-library/diagram.svg"), "<svg/>");
    assert.equal(
      (await findAssets(root, "SHAPE maths"))[0].id,
      "shape-diagram",
    );
    assert.deepEqual(await findAssets(root, "biology"), []);
    await rm(path.join(root, "asset-library/diagram.svg"));
    await assert.rejects(findAssets(root, "shape"), { code: "ENOENT" });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("provenance rules require evidence and block unsafe integrated output", () => {
  const f = fixture();
  const base = {
    id: "asset",
    type: "image",
    path: "asset.svg",
    tags: [],
    description: "Fixture asset",
    source: "customer reference",
    provenanceStatus: "customer-supplied",
    redistribution: "allowed",
  };
  assert.notDeepEqual(validateData("asset-index", { ...f.index, assets: [base] }), []);
  base.authorizationEvidence = "Customer authorization record 2026-09-12";
  assert.deepEqual(validateData("asset-index", { ...f.index, assets: [base] }), []);
  assert.notDeepEqual(
    validateData("asset-index", {
      ...f.index,
      assets: [{ ...base, provenanceStatus: "permissive" }],
    }),
    [],
  );
  assert.notDeepEqual(
    validateData("asset-index", {
      ...f.index,
      assets: [{ ...base, redistribution: "attribution-required" }],
    }),
    [],
  );
  for (const status of ["reference-only", "restricted", "unknown"]) {
    const errors = validateSemantics(f.lesson, f.design, { ...f.index, assets: [{ ...base, provenanceStatus: status }] }, f.runtime, { integrated: true });
    assert.ok(errors.some((error) => error.message.includes("blocks public/integrated")));
  }
  const denied = validateSemantics(f.lesson, f.design, { ...f.index, assets: [{ ...base, redistribution: "denied" }] }, f.runtime, { integrated: true });
  assert.ok(denied.some((error) => error.message.includes("blocks public/integrated")));
});
