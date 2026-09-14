import * as THREE from "three";

export type BaselineNode = {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  visible: boolean;
  renderOrder: number;
  materials: { material: THREE.Material & { opacity?: number; transparent?: boolean }; opacity?: number; transparent?: boolean }[];
};

export type BaselineState = ReadonlyMap<THREE.Object3D, BaselineNode>;
export type PrimitiveAction = { action: string; target: string; [key: string]: unknown };
export type PrimitiveHandler = (action: PrimitiveAction, progress: number) => void;
export type PrimitiveContext = {
  targets: ReadonlyMap<string, THREE.Object3D>;
  baseline: BaselineState;
};
export type GeometryExtensions = {
  dissect?: PrimitiveHandler;
  cutaway?: PrimitiveHandler;
};

const scratch = new THREE.Vector3();
const scratchDirection = new THREE.Vector3();

export function captureBaseline(targets: ReadonlyMap<string, THREE.Object3D>): BaselineState {
  const result = new Map<THREE.Object3D, BaselineNode>();
  for (const object of new Set(targets.values())) {
    object.traverse((node) => {
      const materials = [] as BaselineNode["materials"];
      const values = Array.isArray((node as THREE.Mesh).material)
        ? (node as THREE.Mesh).material
        : [(node as THREE.Mesh).material];
      for (const material of values) {
        if (material && typeof material === "object" && "opacity" in material)
          materials.push({ material: material as BaselineNode["materials"][number]["material"], opacity: material.opacity, transparent: material.transparent });
      }
      result.set(node, { position: node.position.clone(), rotation: node.rotation.clone(), scale: node.scale.clone(), visible: node.visible, renderOrder: node.renderOrder, materials });
    });
  }
  return result;
}

export function restoreBaseline(baseline: BaselineState) {
  for (const [node, state] of baseline) {
    node.position.copy(state.position);
    node.rotation.copy(state.rotation);
    node.scale.copy(state.scale);
    node.visible = state.visible;
    node.renderOrder = state.renderOrder;
    for (const material of state.materials) {
      if (material.opacity !== undefined) material.material.opacity = material.opacity;
      if (material.transparent !== undefined) material.material.transparent = material.transparent;
    }
    delete node.userData.explainAiFocus;
    delete node.userData.explainAiHighlight;
  }
}

function target(context: PrimitiveContext, id: string) {
  const object = context.targets.get(id);
  if (!object) throw new Error(`Missing semantic target: ${id}`);
  return object;
}

function state(context: PrimitiveContext, object: THREE.Object3D) {
  const value = context.baseline.get(object);
  if (!value) throw new Error(`Missing baseline state: ${object.name || "unnamed target"}`);
  return value;
}

function eachNode(object: THREE.Object3D, callback: (node: THREE.Object3D, baseline: BaselineNode) => void, context: PrimitiveContext) {
  object.traverse((node) => {
    const baseline = context.baseline.get(node);
    if (baseline) callback(node, baseline);
  });
}

function setOpacity(object: THREE.Object3D, opacity: number, context: PrimitiveContext) {
  eachNode(object, (_node, baseline) => {
    for (const material of baseline.materials) {
      material.material.opacity = opacity;
      material.material.transparent = opacity < 1 || material.transparent === true;
    }
  }, context);
}

function emphasis(action: PrimitiveAction, progress: number, context: PrimitiveContext, amount: number, marker: string) {
  const object = target(context, action.target);
  const baseline = state(context, object);
  object.scale.copy(baseline.scale).multiplyScalar(1 + amount * progress);
  object.renderOrder = baseline.renderOrder + (progress > 0 ? 1 : 0);
  object.userData[marker] = progress;
}

function isolate(action: PrimitiveAction, progress: number, context: PrimitiveContext) {
  const object = target(context, action.target);
  for (const [id, node] of context.targets) {
    const keep = id === action.target || id.startsWith(`${action.target}.`) || action.target.startsWith(`${id}.`);
    const baseline = state(context, node);
    node.visible = baseline.visible && (progress < 0.5 ? true : keep);
  }
}

export function createSemanticPrimitives(context: PrimitiveContext): ReadonlyMap<string, PrimitiveHandler> {
  return new Map([
    ["focus", (action, progress) => emphasis(action, progress, context, 0.05, "explainAiFocus")],
    ["highlight", (action, progress) => emphasis(action, progress, context, 0.12, "explainAiHighlight")],
    ["isolate", (action, progress) => isolate(action, progress, context)],
    ["extract", (action, progress) => {
      const object = target(context, action.target);
      const baseline = state(context, object);
      const offset = action.offset as { x: number; y: number; z: number };
      object.position.copy(baseline.position).add(scratch.set(offset.x, offset.y, offset.z).multiplyScalar(progress));
    }],
    ["explode", (action, progress) => {
      const object = target(context, action.target);
      const distance = Number(action.distance);
      if (!Number.isFinite(distance) || distance <= 0) throw new Error("Explode distance must be positive");
      eachNode(object, (node, baseline) => {
        if (node === object) return;
        scratchDirection.copy(baseline.position).sub(state(context, object).position);
        if (scratchDirection.lengthSq() === 0) scratchDirection.set(0, 1, 0);
        scratchDirection.normalize();
        node.position.copy(baseline.position).add(scratch.set(0, 0, 0).copy(scratchDirection).multiplyScalar(distance * progress));
      }, context);
    }],
    ["xray", (action, progress) => {
      const object = target(context, action.target);
      const opacity = Number(action.opacity);
      if (!Number.isFinite(opacity) || opacity < 0 || opacity > 1) throw new Error("Xray opacity must be between 0 and 1");
      eachNode(object, (_node, baseline) => {
        for (const material of baseline.materials) {
          const initial = material.opacity ?? 1;
          material.material.opacity = initial + (opacity - initial) * progress;
          material.material.transparent = material.material.opacity < 1 || material.transparent === true;
        }
      }, context);
    }],
    ["magnify", (action, progress) => {
      const object = target(context, action.target);
      const baseline = state(context, object);
      const factor = Number(action.factor);
      if (!Number.isFinite(factor) || factor <= 0) throw new Error("Magnify factor must be positive");
      object.scale.copy(baseline.scale).multiplyScalar(1 + (factor - 1) * progress);
    }],
    ["orbit", (action, progress) => {
      const object = target(context, action.target);
      const baseline = state(context, object);
      object.rotation.copy(baseline.rotation);
      object.rotation.y += (Number(action.degrees) * Math.PI / 180) * progress;
    }],
    ["compare", (action, progress) => {
      const left = target(context, action.target);
      const right = target(context, String(action.with));
      left.position.copy(state(context, left).position).x -= 0.5 * progress;
      right.position.copy(state(context, right).position).x += 0.5 * progress;
    }],
    ["flow", (action, progress) => {
      const object = target(context, action.target);
      const destination = target(context, String(action.to));
      object.position.copy(state(context, object).position).lerp(destination.position, progress);
    }],
  ]);
}

export function resetSemanticPrimitives(context: PrimitiveContext) {
  restoreBaseline(context.baseline);
}
