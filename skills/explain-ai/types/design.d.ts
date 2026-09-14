/* Generated from JSON Schema. Run npm run types:generate; do not edit. */

export interface Design {
  schemaVersion: "2.0.0";
  id: string;
  audience: string;
  lessonColorStrategyDefault: "imitated" | "theme";
  shell: {
    catalogNavigation: "level-subject-lesson";
    lessonPresentation: "continuous-stage";
    inheritTypography: true;
    inheritSpacing: true;
    inheritControls: true;
  };
  /**
   * @minItems 1
   */
  evidence: [
    {
      source: string;
      observation: string;
      kind: "observed" | "inferred" | "user-choice";
    },
    ...{
      source: string;
      observation: string;
      kind: "observed" | "inferred" | "user-choice";
    }[]
  ];
  typography: {
    headingFamily: string;
    bodyFamily: string;
    baseSize: number;
    lineHeight: number;
  };
  spacing: {
    unit: number;
    contentWidth: number;
  };
  colors: {
    background: string;
    text: string;
    accent: string;
    muted: string;
  };
  materials: {
    [k: string]: {
      color: string;
      roughness: number;
      metalness: number;
      opacity: number;
    };
  };
  lighting: {
    style: string;
    intensity: number;
    shadows: boolean;
  };
  shape: {
    style: string;
    edges: string;
    realism: "schematic" | "illustrated" | "realistic";
  };
  motion: {
    duration: number;
    easing: "none" | "power1.inOut" | "power2.inOut" | "sine.inOut";
    ambient: boolean;
    scrollUnits: number;
  };
  camera: {
    default: "wide" | "medium" | "close" | "macro" | "inside" | "orbit" | "top" | "side" | "best";
    expressiveness: "restrained" | "moderate" | "expressive";
  };
  highlighting: {
    color: string;
    surroundingOpacity: number;
    useLabels: boolean;
  };
  labels: {
    size: number;
    style: string;
  };
  mobile: {
    priority: string;
    maxPixelRatio: number;
    simplifyEffects: boolean;
  };
  accessibility: {
    reducedMotion: "static-steps";
    fallback: "text-and-diagram" | "text";
    minimumContrast: number;
  };
}
