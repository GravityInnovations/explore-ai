/* Generated from JSON Schema. Run npm run types:generate; do not edit. */

export interface Catalog {
  schemaVersion: "2.0.0";
  /**
   * @minItems 0
   */
  entries: {
    level: string;
    subject: string;
    topicKey: string;
    slug: string;
    lessonId: string;
    route: string;
    title: string;
  }[];
}
