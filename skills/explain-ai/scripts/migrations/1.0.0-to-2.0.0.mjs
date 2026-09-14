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
  const migrated = {
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
  if (kind === "asset-index") {
    migrated.assets = value.assets.map((asset) => ({
      ...asset,
      provenanceStatus: asset.provenanceStatus ?? "unknown",
      redistribution: asset.redistribution ?? "denied",
    }));
  }
  if (kind === "lesson") {
    migrated.metadata = {
      ...value.metadata,
      contentKind: value.metadata.contentKind ?? "illustrative",
      sources: value.metadata.sources.map((source, index) => ({
        ...source,
        id: source.id ?? `source-${index + 1}`,
      })),
    };
    migrated.quiz = value.quiz ?? { enabled: false, drawCount: 3, questions: [] };
  }
  return migrated;
}
