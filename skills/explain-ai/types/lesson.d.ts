/* Generated from JSON Schema. Run npm run types:generate; do not edit. */

export type Action =
  | Focus
  | Highlight
  | Isolate
  | Assemble
  | Inspect
  | Reveal
  | Hide
  | Extract
  | Explode
  | Dissect
  | Orbit
  | Fade
  | Xray
  | Cutaway
  | Magnify
  | Follow
  | Compare
  | Flow
  | Transform;

export interface Lesson {
  schemaVersion: "1.0.0";
  lessonId: string;
  level: string;
  subject: string;
  topicKey: string;
  slug: string;
  title: string;
  designId: string;
  metadata: {
    summary: string;
    /**
     * @minItems 1
     */
    objectives: [string, ...string[]];
    /**
     * @minItems 0
     */
    sources: Source[];
    scopeNote?: string;
  };
  /**
   * @minItems 0
   */
  assets?: Asset[];
  /**
   * @minItems 1
   */
  objects: [SceneObject, ...SceneObject[]];
  /**
   * @minItems 1
   */
  steps: [Step, ...Step[]];
  accessibility: {
    summary: string;
    staticDiagramAssetId?: string;
  };
}
export interface Source {
  title: string;
  reference: string;
  note?: string;
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
export interface SceneObject {
  id: string;
  parent?: string;
  component: string;
  label: string;
  description: string;
  assetId?: string;
  material?: string;
  position?: Vector;
  scale?: number;
}
export interface Vector {
  x: number;
  y: number;
  z: number;
}
export interface Step {
  id: string;
  title: string;
  text: string;
  /**
   * @minItems 1
   */
  explains: [string, ...string[]];
  /**
   * @minItems 1
   */
  actions: [Action, ...Action[]];
  camera: Camera;
  alt: string;
  narrationAssetId?: string;
  scrollUnits?: number;
}
export interface Focus {
  action: "focus";
  target: string;
}
export interface Highlight {
  action: "highlight";
  target: string;
}
export interface Isolate {
  action: "isolate";
  target: string;
}
export interface Assemble {
  action: "assemble";
  target: string;
}
export interface Inspect {
  action: "inspect";
  target: string;
}
export interface Reveal {
  action: "reveal";
  target: string;
}
export interface Hide {
  action: "hide";
  target: string;
}
export interface Extract {
  action: "extract";
  target: string;
  offset: Vector;
}
export interface Explode {
  action: "explode";
  target: string;
  distance: number;
}
export interface Dissect {
  action: "dissect";
  target: string;
  /**
   * @minItems 1
   */
  parts: [string, ...string[]];
}
export interface Orbit {
  action: "orbit";
  target: string;
  degrees: number;
}
export interface Fade {
  action: "fade";
  target: string;
  opacity: number;
}
export interface Xray {
  action: "xray";
  target: string;
  opacity: number;
}
export interface Cutaway {
  action: "cutaway";
  target: string;
  normal: Vector;
  constant: number;
}
export interface Magnify {
  action: "magnify";
  target: string;
  factor: number;
}
export interface Follow {
  action: "follow";
  target: string;
  /**
   * @minItems 2
   */
  path: [string, string, ...string[]];
}
export interface Compare {
  action: "compare";
  target: string;
  with: string;
}
export interface Flow {
  action: "flow";
  target: string;
  to: string;
}
export interface Transform {
  action: "transform";
  target: string;
  position?: Vector;
  rotation?: Vector;
  scale?: number;
}
export interface Camera {
  mode: "wide" | "medium" | "close" | "macro" | "inside" | "orbit" | "top" | "side" | "best";
  target: string;
  position?: Vector;
  lookAt?: Vector;
}
