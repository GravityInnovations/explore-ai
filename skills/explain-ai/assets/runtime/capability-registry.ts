import type { Object3D } from "three";
import { createSemanticPrimitives, type PrimitiveContext, type PrimitiveHandler } from "./semantic-primitives";

export type CapabilityManifest = { actions: string[]; components: { id: string; actions: string[] }[] };

export function createCapabilityRegistry(context: PrimitiveContext) {
  return createSemanticPrimitives(context);
}

export function assertCapabilityManifest(
  manifest: CapabilityManifest,
  handlers: ReadonlyMap<string, PrimitiveHandler>,
  components: ReadonlyMap<string, ReadonlySet<string>> = new Map(),
) {
  for (const action of manifest.actions)
    if (!handlers.has(action)) throw new Error(`Manifest advertises action without handler: ${action}`);
  for (const component of manifest.components) {
    const implemented = components.get(component.id);
    for (const action of component.actions)
      if (!handlers.has(action) || !implemented?.has(action))
        throw new Error(`Component ${component.id} advertises unusable action: ${action}`);
  }
  return true;
}

export function assertSemanticTargets(targets: ReadonlyMap<string, Object3D>, lessonTargets: readonly string[]) {
  for (const id of lessonTargets)
    if (!targets.has(id)) throw new Error(`Missing semantic target: ${id}`);
}
