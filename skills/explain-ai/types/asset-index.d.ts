/* Generated from JSON Schema. Run npm run types:generate; do not edit. */

export interface AssetIndex {
  schemaVersion: "2.0.0";
  /**
   * @minItems 0
   */
  assets: Asset[];
}
export interface Asset {
  id: string;
  type: "model" | "image" | "texture" | "audio" | "component";
  path: string;
  /**
   * @minItems 0
   */
  tags: string[];
  description: string;
  license: string;
  source: string;
  /**
   * @minItems 0
   */
  semanticTargets?: string[];
}
