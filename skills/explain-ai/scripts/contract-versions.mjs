import path from "node:path";
import { fileURLToPath } from "node:url";

export const DATA_CONTRACT_VERSION = "2.0.0";
export const WORKFLOW_CONTRACT_VERSION = "1.2.0";
export const LEGACY_WORKFLOW_CONTRACT_VERSIONS = Object.freeze(["1.0.0", "1.1.0"]);
export const LEGACY_DATA_CONTRACT_VERSIONS = Object.freeze(["1.0.0"]);
export const DATA_CONTRACT_KINDS = Object.freeze([
  "project",
  "design",
  "asset-index",
  "runtime",
  "lesson",
]);

export function workflowMigrationRequiredError(actual) {
  return {
    path: "/schemaVersion",
    code: "WORKFLOW_MIGRATION_REQUIRED",
    message: `Unsupported workflow contract version ${JSON.stringify(actual)}; expected ${JSON.stringify(WORKFLOW_CONTRACT_VERSION)}. Existing workflow state must be restarted or migrated explicitly before continuing.`,
  };
}

export function migrationCommand(project = "<project>") {
  const script = fileURLToPath(new URL("migrate.mjs", import.meta.url));
  const target = project === "<project>" ? project : path.resolve(project);
  return `node ${JSON.stringify(script)} --project ${JSON.stringify(target)}`;
}

export function migrationRequiredError(kind, actual, project) {
  return {
    path: "/schemaVersion",
    code: "MIGRATION_REQUIRED",
    message: `Unsupported ${kind} contract version ${JSON.stringify(actual)}; expected ${JSON.stringify(DATA_CONTRACT_VERSION)}. Migration required: ${migrationCommand(project)}`,
  };
}
