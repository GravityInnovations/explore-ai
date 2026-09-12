import { DATA_CONTRACT_VERSION } from "../contract-versions.mjs";

export const migrationId = "1.0.0-to-2.0.0";
export const fromVersion = "1.0.0";
export const toVersion = DATA_CONTRACT_VERSION;

export function migrateContract(kind, value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(`Cannot migrate ${kind}: expected a JSON object`);
  if (value.schemaVersion !== fromVersion)
    throw new Error(
      `Cannot migrate ${kind}: expected schemaVersion ${JSON.stringify(fromVersion)}, received ${JSON.stringify(value.schemaVersion)}`,
    );
  return {
    ...value,
    schemaVersion: toVersion,
    ...(kind === "project" && !value.paths.catalog
      ? { paths: { ...value.paths, catalog: "catalog/index.json" } }
      : {}),
    ...(kind === "design" && !value.lessonColorStrategyDefault
      ? { lessonColorStrategyDefault: "theme" }
      : {}),
    ...(kind === "design" && !value.shell
      ? {
          shell: {
            catalogNavigation: "level-subject-lesson",
            lessonPresentation: "continuous-stage",
            inheritTypography: true,
            inheritSpacing: true,
            inheritControls: true,
          },
        }
      : {}),
  };
}
