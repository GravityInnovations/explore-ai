/* Generated from JSON Schema. Run npm run types:generate; do not edit. */

export type Asset = {
  [k: string]: unknown;
} & {
  id: string;
  type: "model" | "image" | "texture" | "audio" | "component";
  path: string;
  /**
   * @minItems 0
   */
  tags: string[];
  description: string;
  license?: string;
  source: string;
  provenanceStatus: "original" | "permissive" | "customer-supplied" | "reference-only" | "restricted" | "unknown";
  redistribution: "allowed" | "attribution-required" | "denied";
  attribution?: string;
  authorizationEvidence?: string;
  /**
   * @minItems 0
   */
  semanticTargets?: string[];
};

export interface AssetIndex {
  schemaVersion: "2.0.0";
  /**
   * @minItems 0
   */
  assets: Asset[];
}
