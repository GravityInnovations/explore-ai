"use client";

import * as THREE from "three";
import type { Design } from "../.agents/skills/explore-ai/types/design";
import type { Lesson, Step } from "../.agents/skills/explore-ai/types/lesson";
import type { SceneAdapter } from "../.agents/skills/explore-ai/assets/templates/controller";

type WorldMount = {
  adapter: SceneAdapter;
  renderFrame: () => void;
  dispose: () => void;
};

const colors = {
  leaf: "#65a95c",
  leafLight: "#8bcf72",
  twig: "#8b644b",
  egg: "#f5d48a",
  caterpillar: "#7fbd55",
  caterpillarDark: "#4d7d42",
  chrysalis: "#b99055",
  wingA: "#f7b84b",
  wingB: "#e96f66",
  wingBlue: "#8c73cf",
  dark: "#392f45",
  highlight: "#7c3aed",
};

function material(color: string, roughness = 0.78) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 });
}

function leafGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.95, 0);
  shape.quadraticCurveTo(-0.45, 0.78, 0.55, 0.58);
  shape.quadraticCurveTo(1.05, 0.22, 0.95, 0);
  shape.quadraticCurveTo(0.35, -0.58, -0.95, 0);
  return new THREE.ShapeGeometry(shape, 18);
}

function wingGeometry(side: 1 | -1) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(side * 0.12, 0.8, side * 0.95, 1.25, side * 1.05, 0.48);
  shape.bezierCurveTo(side * 1.1, -0.05, side * 0.68, -0.62, side * 0.12, -0.35);
  shape.quadraticCurveTo(side * 0.02, -0.12, 0, 0);
  return new THREE.ShapeGeometry(shape, 20);
}

function tubeBetween(a: THREE.Vector3, b: THREE.Vector3, radius: number, mat: THREE.Material) {
  const direction = new THREE.Vector3().subVectors(b, a);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 0.88, direction.length(), 12), mat);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return mesh;
}

function makeLeaf() {
  const group = new THREE.Group();
  const leaf = new THREE.Mesh(leafGeometry(), material(colors.leaf));
  leaf.rotation.x = -Math.PI / 2;
  leaf.rotation.z = 0.08;
  group.add(leaf);
  const rib = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 1.7, 8), material(colors.leafLight));
  rib.rotation.z = Math.PI / 2;
  rib.rotation.x = -Math.PI / 2;
  rib.position.set(0, 0.03, 0.02);
  group.add(rib);
  return group;
}

function makePlant() {
  const group = new THREE.Group();
  const twig = new THREE.Group();
  twig.add(tubeBetween(new THREE.Vector3(-0.5, -1.1, 0), new THREE.Vector3(0.12, 1.02, 0), 0.095, material(colors.twig)));
  twig.add(tubeBetween(new THREE.Vector3(0.02, 0.28, 0), new THREE.Vector3(0.75, 1.12, 0), 0.06, material(colors.twig)));
  group.add(twig);
  const leafA = makeLeaf();
  leafA.position.set(-1.55, -1.12, 0);
  leafA.rotation.z = -0.2;
  group.add(leafA);
  const leafB = makeLeaf();
  leafB.position.set(1.55, -1.12, 0);
  leafB.rotation.z = Math.PI + 0.18;
  group.add(leafB);
  return { group, twig, leafA, leafB };
}

function makeEgg() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.18, 18, 14), material(colors.egg));
  body.scale.set(0.82, 1.15, 0.82);
  group.add(body);
  for (let i = -1; i <= 1; i++) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(0.145, 0.012, 6, 16), material(colors.egg));
    rib.rotation.x = Math.PI / 2;
    rib.position.y = i * 0.055;
    group.add(rib);
  }
  return group;
}

function makeCaterpillar() {
  const group = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const segment = new THREE.Mesh(new THREE.SphereGeometry(i === 5 ? 0.23 : 0.2, 16, 12), material(i % 2 ? colors.caterpillar : colors.leafLight));
    segment.position.set((i - 2.5) * 0.23, Math.sin(i * 0.9) * 0.04, 0);
    group.add(segment);
    if (i < 5) {
      const legL = tubeBetween(new THREE.Vector3(segment.position.x, segment.position.y - 0.11, 0.04), new THREE.Vector3(segment.position.x - 0.04, segment.position.y - 0.2, 0.18), 0.022, material(colors.caterpillarDark));
      const legR = tubeBetween(new THREE.Vector3(segment.position.x, segment.position.y - 0.11, -0.04), new THREE.Vector3(segment.position.x + 0.04, segment.position.y - 0.2, -0.18), 0.022, material(colors.caterpillarDark));
      group.add(legL, legR);
    }
  }
  const head = group.children[5] as THREE.Mesh;
  const eyeMat = material(colors.dark);
  for (const z of [-0.08, 0.08]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), eyeMat);
    eye.position.set(0.15, 0.08, z);
    group.add(eye);
  }
  const antennaMat = material(colors.caterpillarDark);
  group.add(tubeBetween(new THREE.Vector3(0.1, 0.15, 0.08), new THREE.Vector3(0.28, 0.36, 0.08), 0.018, antennaMat));
  group.add(tubeBetween(new THREE.Vector3(0.1, 0.15, -0.08), new THREE.Vector3(0.28, 0.36, -0.08), 0.018, antennaMat));
  return group;
}

function makeChrysalis() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.28, 18, 16), material(colors.chrysalis));
  body.scale.set(0.7, 1.55, 0.7);
  group.add(body);
  for (let i = -2; i <= 2; i++) {
    const ridge = new THREE.Mesh(new THREE.TorusGeometry(0.2 - Math.abs(i) * 0.018, 0.018, 6, 16), material("#d8b77d"));
    ridge.rotation.x = Math.PI / 2;
    ridge.position.y = i * 0.14;
    group.add(ridge);
  }
  group.add(tubeBetween(new THREE.Vector3(0, 0.48, 0), new THREE.Vector3(0, 0.76, 0), 0.025, material(colors.twig)));
  return group;
}

function makeButterfly() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.72, 8, 14), material(colors.dark));
  body.rotation.z = Math.PI / 2;
  group.add(body);
  const wingMatA = material(colors.wingA);
  const wingMatB = material(colors.wingB);
  const left = new THREE.Mesh(wingGeometry(-1), wingMatA);
  const right = new THREE.Mesh(wingGeometry(1), wingMatB);
  left.position.set(0, 0.05, 0.08);
  right.position.set(0, 0.05, -0.08);
  group.add(left, right);
  const lowerL = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 12), material(colors.wingBlue));
  lowerL.scale.set(1.15, 0.7, 0.12);
  lowerL.position.set(-0.36, -0.4, 0.1);
  const lowerR = lowerL.clone();
  lowerR.material = material(colors.wingB);
  lowerR.position.z = -0.1;
  lowerR.position.x = 0.36;
  group.add(lowerL, lowerR);
  const antennaMat = material(colors.dark);
  group.add(tubeBetween(new THREE.Vector3(0.24, 0.33, 0.07), new THREE.Vector3(0.56, 0.62, 0.08), 0.018, antennaMat));
  group.add(tubeBetween(new THREE.Vector3(0.24, 0.33, -0.07), new THREE.Vector3(0.56, 0.62, -0.08), 0.018, antennaMat));
  for (const x of [-0.12, 0.12]) {
    group.add(tubeBetween(new THREE.Vector3(x, -0.26, 0.06), new THREE.Vector3(x - 0.14, -0.52, 0.12), 0.016, antennaMat));
    group.add(tubeBetween(new THREE.Vector3(x, -0.26, -0.06), new THREE.Vector3(x + 0.14, -0.52, -0.12), 0.016, antennaMat));
  }
  return group;
}

function setVisible(group: THREE.Object3D, visible: boolean) {
  group.visible = visible;
}

function allMaterials(root: THREE.Object3D) {
  const values: THREE.MeshStandardMaterial[] = [];
  root.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      const list = Array.isArray(node.material) ? node.material : [node.material];
      list.forEach((item) => {
        if (item instanceof THREE.MeshStandardMaterial && !values.includes(item)) values.push(item);
      });
    }
  });
  return values;
}

export function mountButterflyLifeCycleWorld(canvas: HTMLCanvasElement, lesson: Lesson, design: Design): WorldMount {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, design.mobile.maxPixelRatio));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(design.colors.background);
  scene.add(new THREE.HemisphereLight("#fff8f2", "#b695ef", design.lighting.intensity * 2));
  const keyLight = new THREE.DirectionalLight("#fff8f2", design.lighting.intensity * 3);
  keyLight.position.set(-3, 4, 6);
  scene.add(keyLight);
  const viewCamera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  const world = new THREE.Group();
  scene.add(world);
  const plant = makePlant();
  world.add(plant.group);
  const egg = makeEgg(); egg.position.set(-1.48, -0.7, 0.18); world.add(egg);
  const caterpillar = makeCaterpillar(); caterpillar.position.set(-0.55, -0.52, 0.22); caterpillar.rotation.z = 0.08; world.add(caterpillar);
  const chrysalis = makeChrysalis(); chrysalis.position.set(0.22, 0.52, 0.18); world.add(chrysalis);
  const butterfly = makeButterfly(); butterfly.position.set(0.9, 0.02, 0.25); butterfly.rotation.z = -0.08; world.add(butterfly);
  const newEgg = makeEgg(); newEgg.position.set(1.5, -0.7, 0.22); newEgg.scale.setScalar(0.9); world.add(newEgg);
  world.scale.setScalar(1.05);

  const semantic = new Map<string, THREE.Object3D>([
    ["world", world], ["world.plant", plant.group], ["world.plant.twig", plant.twig], ["world.plant.leafA", plant.leafA], ["world.plant.leafB", plant.leafB],
    ["world.egg", egg], ["world.caterpillar", caterpillar], ["world.chrysalis", chrysalis], ["world.butterfly", butterfly], ["world.newEgg", newEgg],
  ]);
  const baselines = new Map<string, { position: THREE.Vector3; rotation: THREE.Euler; scale: THREE.Vector3; visible: boolean }>();
  semantic.forEach((node, id) => baselines.set(id, { position: node.position.clone(), rotation: node.rotation.clone(), scale: node.scale.clone(), visible: node.visible }));
  const ownedMaterials = allMaterials(world);
  const baselineColors = new Map(ownedMaterials.map((item) => [item, item.color.clone()]));
  const emphasis = new Set<string>();
  const objectFor = (id: string) => semantic.get(id) ?? semantic.get(id.replace(/^world\./, "world."));
  const resetBaseline = () => {
    semantic.forEach((node, id) => {
      const baseline = baselines.get(id)!;
      node.position.copy(baseline.position); node.rotation.copy(baseline.rotation); node.scale.copy(baseline.scale); node.visible = baseline.visible;
    });
    emphasis.clear();
    ownedMaterials.forEach((item) => { item.color.copy(baselineColors.get(item)!); item.emissive.set(0x000000); item.emissiveIntensity = 0; });
  };
  const highlight = (target: string) => {
    emphasis.add(target);
    const node = objectFor(target);
    if (!node) return;
    node.scale.multiplyScalar(1.08);
    node.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.emissive.set(colors.highlight); child.material.emissiveIntensity = 0.18;
      }
    });
  };
  const handlers: SceneAdapter["handlers"] = {
    focus: (action) => { objectFor(action.target); },
    highlight: (action) => highlight(action.target),
    hide: (action) => { const node = objectFor(action.target); if (node) setVisible(node, false); },
    reveal: (action) => { const node = objectFor(action.target); if (node) setVisible(node, true); },
    magnify: (action, progress) => { const node = objectFor(action.target); if (node) node.scale.multiplyScalar(1 + (action.factor - 1) * progress); },
  };
  const sampleCamera = (intent: Step["camera"]) => {
    const target = objectFor(intent.target) ?? world;
    const box = new THREE.Box3().setFromObject(target);
    const center = box.getCenter(new THREE.Vector3());
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const distance = intent.mode === "wide" ? 7.4 : intent.mode === "medium" ? 5.4 : intent.mode === "close" ? 3.3 : 6;
    const position = intent.position ? new THREE.Vector3(intent.position.x, intent.position.y, intent.position.z) : new THREE.Vector3(center.x + 0.1, center.y + 0.05, distance);
    viewCamera.position.copy(position);
    const lookAt = intent.lookAt ? new THREE.Vector3(intent.lookAt.x, intent.lookAt.y, intent.lookAt.z) : center;
    viewCamera.lookAt(lookAt);
    viewCamera.near = Math.max(0.05, distance / 100); viewCamera.far = 100; viewCamera.updateProjectionMatrix();
    void sphere;
  };
  const render = () => renderer.render(scene, viewCamera);
  const resize = () => { const rect = canvas.getBoundingClientRect(); const width = Math.max(1, rect.width); const height = Math.max(1, rect.height); renderer.setSize(width, height, false); viewCamera.aspect = width / height; viewCamera.updateProjectionMatrix(); render(); };
  const observer = new ResizeObserver(resize); observer.observe(canvas.parentElement ?? canvas); resize();
  const ambient = window.matchMedia("(prefers-reduced-motion: reduce)");
  let raf = 0;
  const animate = () => { if (!ambient.matches) world.rotation.y = Math.sin(performance.now() * 0.00035) * 0.025; render(); raf = requestAnimationFrame(animate); };
  raf = requestAnimationFrame(animate);
  const adapter: SceneAdapter = { resetBaseline, handlers, camera: sampleCamera, render: () => render(), dispose: () => { cancelAnimationFrame(raf); observer.disconnect(); scene.traverse((node) => { if (node instanceof THREE.Mesh) { node.geometry.dispose(); const mats = Array.isArray(node.material) ? node.material : [node.material]; mats.forEach((mat) => mat.dispose()); } }); renderer.dispose(); } };
  return { adapter, renderFrame: render, dispose: adapter.dispose };
}

export type { WorldMount };
