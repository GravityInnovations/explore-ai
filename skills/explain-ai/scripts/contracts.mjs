import { readFile, readdir } from "node:fs/promises";
import Ajv from "ajv/dist/2020.js";
import {
  DATA_CONTRACT_KINDS,
  DATA_CONTRACT_VERSION,
  migrationRequiredError,
} from "./contract-versions.mjs";
const ajv = new Ajv({ strict: true, allErrors: true });
const folder = new URL("../schemas/", import.meta.url);
for (const name of (await readdir(folder)).filter((name) =>
  name.endsWith(".schema.json"),
))
  ajv.addSchema(JSON.parse(await readFile(new URL(name, folder), "utf8")));
export function validateData(kind, value, { project } = {}) {
  const validator = ajv.getSchema(
    `https://gravityinnovations.github.io/explore-ai/schemas/${kind}.schema.json`,
  );
  if (!validator) throw new Error(`Unknown contract: ${kind}`);
  if (
    DATA_CONTRACT_KINDS.includes(kind) &&
    typeof value?.schemaVersion === "string" &&
    value.schemaVersion !== DATA_CONTRACT_VERSION
  )
    return [migrationRequiredError(kind, value.schemaVersion, project)];
  if (validator(value)) return [];
  return validator.errors.map((error) => ({
    path: error.instancePath || "/",
    message: `${error.message}${error.params.additionalProperty ? `: ${error.params.additionalProperty}` : ""}${error.params.missingProperty ? `: ${error.params.missingProperty}` : ""}`,
  }));
}

export async function readJson(file) {
  return JSON.parse((await readFile(file, "utf8")).replace(/^\uFEFF/, ""));
}
export async function readContract(kind, file, options) {
  const value = await readJson(file);
  const errors = validateData(kind, value, options);
  if (errors.length)
    throw new Error(
      `${file}: ${errors.map((e) => `${e.path} ${e.message}`).join("; ")}`,
    );
  return value;
}
