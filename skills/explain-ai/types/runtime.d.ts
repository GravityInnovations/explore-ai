/* Generated from JSON Schema. Run npm run types:generate; do not edit. */

export interface Runtime {
  schemaVersion: "2.0.0";
  /**
   * @minItems 0
   */
  actions: (
    | "focus"
    | "highlight"
    | "isolate"
    | "extract"
    | "explode"
    | "dissect"
    | "assemble"
    | "orbit"
    | "inspect"
    | "reveal"
    | "hide"
    | "fade"
    | "xray"
    | "cutaway"
    | "magnify"
    | "follow"
    | "compare"
    | "flow"
    | "transform"
  )[];
  /**
   * @minItems 1
   */
  cameraModes: [
    "wide" | "medium" | "close" | "macro" | "inside" | "orbit" | "top" | "side" | "best",
    ...("wide" | "medium" | "close" | "macro" | "inside" | "orbit" | "top" | "side" | "best")[]
  ];
  /**
   * @minItems 0
   */
  components: {
    id: string;
    /**
     * @minItems 0
     */
    actions: (
      | "focus"
      | "highlight"
      | "isolate"
      | "extract"
      | "explode"
      | "dissect"
      | "assemble"
      | "orbit"
      | "inspect"
      | "reveal"
      | "hide"
      | "fade"
      | "xray"
      | "cutaway"
      | "magnify"
      | "follow"
      | "compare"
      | "flow"
      | "transform"
    )[];
  }[];
}
