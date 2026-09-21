import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export type LessonRuntime = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  dispose(): void;
};

/** Create the primary Three.js + GSAP ScrollTrigger lesson boundary. */
export function mountLessonRuntime(
  canvas: HTMLCanvasElement,
  section: HTMLElement,
  onProgress: (progress: number) => void,
): LessonRuntime {
  if (!canvas || !section) throw new Error("Lesson runtime needs canvas and section");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  gsap.registerPlugin(ScrollTrigger);
  const trigger = ScrollTrigger.create({
    trigger: section,
    start: "top center",
    end: "bottom center",
    onUpdate: (self) => onProgress(self.progress),
  });
  const resize = () => {
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener("resize", resize);
  return {
    scene,
    camera,
    renderer,
    dispose() {
      trigger.kill();
      window.removeEventListener("resize", resize);
      renderer.dispose();
    },
  };
}
