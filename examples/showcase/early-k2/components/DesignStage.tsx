"use client";

import { useEffect, useRef } from "react";
import profile from "@/design/profile.json";
import { Illustration } from "./Illustration";

// An abstract material/scroll study only, not a lesson renderer or semantic model.
export function DesignStage({ step }: { step: number }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let release = () => {};
    let generation = 0;
    async function mount() {
      const current = ++generation;
      release();
      release = () => {};
      if (motion.matches) return;
      const [THREE, { RoundedBoxGeometry }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import("three"), import("three/examples/jsm/geometries/RoundedBoxGeometry.js"), import("gsap"), import("gsap/ScrollTrigger"),
      ]);
      if (disposed || current !== generation || !element) return;
      gsap.registerPlugin(ScrollTrigger);
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try { renderer = new THREE.WebGLRenderer({ antialias: true }); } catch { return; }
      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#eee3fd");
      const camera = new THREE.PerspectiveCamera(35, 1, .1, 30);
      camera.position.set(0, 0, 7);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, profile.mobile.maxPixelRatio));
      const geometry = new RoundedBoxGeometry(1.8, 1.8, 1.8, 4, .35);
      const material = new THREE.MeshStandardMaterial(profile.materials.primary);
      const form = new THREE.Mesh(geometry, material);
      form.rotation.set(.18, -.35 + step * .25, .08);
      scene.add(form);
      scene.add(new THREE.HemisphereLight("#fff8f2", "#b695ef", profile.lighting.intensity * 2));
      const light = new THREE.DirectionalLight("#fff8f2", profile.lighting.intensity * 3);
      light.position.set(-3, 4, 5);
      scene.add(light);
      const draw = () => renderer.render(scene, camera);
      const resize = () => {
        const { width, height } = element.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        draw();
      };
      renderer.domElement.setAttribute("aria-hidden", "true");
      element.appendChild(renderer.domElement);
      const lost = (event: Event) => { event.preventDefault(); release(); };
      renderer.domElement.addEventListener("webglcontextlost", lost);
      const observer = new ResizeObserver(resize);
      observer.observe(element);
      resize();
      const turn = gsap.to(form.rotation, { y: form.rotation.y + .5, ease: profile.motion.easing, onUpdate: draw,
        scrollTrigger: { trigger: element, start: "top bottom", end: `+=${window.innerHeight * profile.motion.scrollUnits}`, scrub: profile.motion.duration },
      });
      release = () => {
        turn.scrollTrigger?.kill(); turn.kill(); observer.disconnect();
        renderer.domElement.removeEventListener("webglcontextlost", lost);
        renderer.domElement.remove(); geometry.dispose(); material.dispose(); renderer.dispose();
      };
    }
    const update = () => { void mount().catch(() => release()); };
    update();
    motion.addEventListener("change", update);
    return () => { disposed = true; generation++; motion.removeEventListener("change", update); release(); };
  }, [step]);

  return <figure className="stage" style={{ margin: 0 }}>
    <div className="stage-visual" ref={host}><div className="stage-fallback"><Illustration compact /></div></div>
    <figcaption className="stage-caption"><p>Rounded forms. Soft edges. Room to look.</p><span className="muted">Decorative design study — no lesson content.</span></figcaption>
  </figure>;
}
