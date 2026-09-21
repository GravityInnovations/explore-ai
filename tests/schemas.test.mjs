import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import Ajv from "../skills/explore-ai/node_modules/ajv/dist/2020.js";
import { fixture } from "./fixtures.mjs";
import { validateData } from "../skills/explore-ai/scripts/contracts.mjs";

test("all contracts compile in strict Draft 2020-12 mode", async () => {
  const ajv = new Ajv({ strict: true });
  const folder = new URL("../skills/explore-ai/schemas/", import.meta.url);
  const schemas = await Promise.all(
    (await readdir(folder))
      .filter((name) => name.endsWith(".schema.json"))
      .map(async (name) =>
        JSON.parse(await readFile(new URL(name, folder), "utf8")),
      ),
  );
  schemas.forEach((schema) => ajv.addSchema(schema));
  schemas.forEach((schema) =>
    assert.equal(typeof ajv.getSchema(schema.$id), "function"),
  );
});

test("text is a valid default fallback and diagrams remain explicit opt-ins", () => {
  const value = fixture();
  assert.deepEqual(validateData("design", value.design), []);
  value.design.accessibility.fallback = "text-and-diagram";
  assert.deepEqual(validateData("design", value.design), []);
  assert.deepEqual(validateData("lesson", value.lesson), []);
  value.lesson.accessibility.staticDiagramAssetId = "optional-diagram";
  assert.deepEqual(validateData("lesson", value.lesson), []);
});
