/* Generated from JSON Schema. Run npm run types:generate; do not edit. */

export interface DesignerWorkflow {
  schemaVersion: "1.1.0";
  session: string;
  revision: number;
  stage: "interview" | "brief-review" | "design" | "qa" | "design-review" | "accepted";
  decisions: {
    audience?: {
      value: string;
      source: "user" | "delegated" | "proposed";
      evidence: string;
    };
    brand?: {
      value: string;
      source: "user" | "delegated" | "proposed";
      evidence: string;
    };
    typography?: {
      value: string;
      source: "user" | "delegated" | "proposed";
      evidence: string;
    };
    palette?: {
      value: string;
      source: "user" | "delegated" | "proposed";
      evidence: string;
    };
    layout?: {
      value: string;
      source: "user" | "delegated" | "proposed";
      evidence: string;
    };
    visuals?: {
      value: string;
      source: "user" | "delegated" | "proposed";
      evidence: string;
    };
    motion?: {
      value: string;
      source: "user" | "delegated" | "proposed";
      evidence: string;
    };
    accessibility?: {
      value: string;
      source: "user" | "delegated" | "proposed";
      evidence: string;
    };
    constraints?: {
      value: string;
      source: "user" | "delegated" | "proposed";
      evidence: string;
    };
  };
  pendingChoice: {
    [k: string]: unknown;
  } | null;
  brief: {
    summary: string;
    fingerprint: string;
    agreement: {
      fingerprint: string;
      statement: string;
      at: string;
    } | null;
  } | null;
  preview: {
    url: string;
    /**
     * @minItems 1
     */
    paths: [string, ...string[]];
    fingerprint: string;
  } | null;
  qa: {
    check: "contracts" | "desktop" | "mobile" | "labels" | "keyboard" | "motion" | "fallback" | "app-check";
    result: "pass" | "fail" | "not-applicable";
    evidence: string;
    fingerprint: string;
  }[];
  feedback: {
    stage: string;
    note: string;
    at: string;
  }[];
  acceptance: {
    fingerprint: string;
    statement: string;
    at: string;
  } | null;
}
