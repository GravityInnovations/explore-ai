import { Box3, PerspectiveCamera, Sphere, Vector3 } from 'three';

export type BoundsCameraMode = 'wide' | 'medium' | 'close' | 'macro' | 'top' | 'side' | 'best';
/** Fit the bounding sphere against the smaller horizontal/vertical field of view. */
export function frameBounds(bounds: Box3, camera: PerspectiveCamera, mode: BoundsCameraMode = 'best') {
  if (bounds.isEmpty() || camera.aspect <= 0 || camera.fov <= 0 || camera.fov >= 180) throw new Error('Invalid bounds or camera');
  const sphere = bounds.getBoundingSphere(new Sphere());
  const vertical = camera.getEffectiveFOV() * Math.PI / 180;
  const horizontal = 2 * Math.atan(Math.tan(vertical / 2) * camera.aspect);
  const padding = { wide: 2, medium: 1.4, close: 1.15, macro: 1.05, top: 1.2, side: 1.2, best: 1.2 }[mode];
  const distance = Math.max(sphere.radius, 0.01) / Math.sin(Math.min(vertical, horizontal) / 2) * padding;
  const direction = mode === 'top' ? new Vector3(0, 1, 0.001) : mode === 'side' ? new Vector3(1, 0, 0) : camera.position.clone().sub(sphere.center);
  if (direction.lengthSq() === 0) direction.set(0, 0, 1);
  return { position: sphere.center.clone().add(direction.normalize().multiplyScalar(distance)), lookAt: sphere.center, near: Math.max(0.001, (distance - sphere.radius) / 10), far: Math.max(100, distance + sphere.radius * 4) };
}
