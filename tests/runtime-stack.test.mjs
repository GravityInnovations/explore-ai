import { test } from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger.js";

test("the required runtime stack creates a real Three.js scene and registers ScrollTrigger", () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();
  assert.ok(scene instanceof THREE.Scene);
  assert.ok(camera instanceof THREE.PerspectiveCamera);
  assert.doesNotThrow(() => gsap.registerPlugin(ScrollTrigger));
  assert.equal(typeof ScrollTrigger.create, "function");
});

test("the runtime stack is not satisfied by package names alone", () => {
  const scene = new THREE.Scene();
  assert.equal(scene.children.length, 0);
  assert.equal(typeof ScrollTrigger.create, "function");
});
