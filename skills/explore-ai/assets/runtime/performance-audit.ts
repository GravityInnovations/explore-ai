import type { Object3D, Scene, WebGLRenderer } from "three";

export const DEFAULT_PERFORMANCE_BUDGETS = Object.freeze({
  devicePixelRatio: 2,
  drawCalls: 120,
  visibleTriangles: 250_000,
  maxTextureDimension: 2048,
  textureMemoryBytes: 64 * 1024 * 1024,
  shadowLights: 2,
  particles: 5000,
});

export type PerformanceBudgets = Partial<typeof DEFAULT_PERFORMANCE_BUDGETS>;
export type PerformanceMetrics = typeof DEFAULT_PERFORMANCE_BUDGETS;
export type PerformanceAudit = {
  metrics: PerformanceMetrics;
  budgets: typeof DEFAULT_PERFORMANCE_BUDGETS;
  violations: string[];
  overridden: boolean;
  valid: boolean;
};

function budgetValues(budgets: PerformanceBudgets) {
  return { ...DEFAULT_PERFORMANCE_BUDGETS, ...budgets };
}

export function auditPerformance(
  metrics: PerformanceMetrics,
  budgets: PerformanceBudgets = {},
  budgetOverrideReason = "",
): PerformanceAudit {
  const resolved = budgetValues(budgets);
  const violations = Object.keys(resolved)
    .filter((key) => metrics[key as keyof PerformanceMetrics] > resolved[key as keyof PerformanceMetrics])
    .map((key) => `${key} exceeds budget (${metrics[key as keyof PerformanceMetrics]} > ${resolved[key as keyof PerformanceMetrics]})`);
  const overridden = violations.length > 0 && budgetOverrideReason.trim().length > 0;
  return { metrics, budgets: resolved, violations, overridden, valid: violations.length === 0 || overridden };
}

function triangleCount(node: Object3D) {
  let triangles = 0;
  node.traverse((child) => {
    const geometry = (child as Object3D & { geometry?: { index?: { count: number }; attributes?: { position?: { count: number } } } }).geometry;
    if (geometry) triangles += geometry.index ? geometry.index.count / 3 : (geometry.attributes?.position?.count ?? 0) / 3;
  });
  return Math.ceil(triangles);
}

export function measureScene(scene: Scene, renderer?: WebGLRenderer): PerformanceMetrics {
  let shadowLights = 0;
  let particles = 0;
  let maxTextureDimension = 0;
  let textureMemoryBytes = 0;
  let drawCalls = 0;
  scene.traverse((node) => {
    const candidate = node as Object3D & { isLight?: boolean; castShadow?: boolean; userData: { particleCount?: number }; material?: { map?: { image?: { width?: number; height?: number } } } };
    if (candidate.isLight && candidate.castShadow) shadowLights++;
    particles += Number(candidate.userData.particleCount ?? 0);
    const image = candidate.material?.map?.image;
    if (image) {
      const width = Number(image.width ?? 0);
      const height = Number(image.height ?? 0);
      maxTextureDimension = Math.max(maxTextureDimension, width, height);
      textureMemoryBytes += width * height * 4;
    }
    if ((node as Object3D & { isMesh?: boolean }).isMesh) drawCalls++;
  });
  const info = renderer?.info?.render;
  return {
    devicePixelRatio: renderer?.getPixelRatio?.() ?? 1,
    drawCalls: info?.calls ?? drawCalls,
    visibleTriangles: info?.triangles ?? triangleCount(scene),
    maxTextureDimension,
    textureMemoryBytes,
    shadowLights,
    particles,
  };
}

export function auditScene(scene: Scene, renderer?: WebGLRenderer, budgets?: PerformanceBudgets, budgetOverrideReason?: string) {
  return auditPerformance(measureScene(scene, renderer), budgets, budgetOverrideReason);
}

export type ResourceLedger = ReturnType<typeof createResourceLedger>;
export function createResourceLedger() {
  const owned = new Map<string, number>();
  let disposed = false;
  return {
    own(kind: string) {
      if (disposed) throw new Error("Resource ledger is disposed");
      owned.set(kind, (owned.get(kind) ?? 0) + 1);
    },
    release(kind: string) {
      const count = owned.get(kind) ?? 0;
      if (!count) throw new Error(`Resource was not owned: ${kind}`);
      if (count === 1) owned.delete(kind); else owned.set(kind, count - 1);
    },
    snapshot() { return Object.fromEntries(owned); },
    dispose() { disposed = true; owned.clear(); },
  };
}
