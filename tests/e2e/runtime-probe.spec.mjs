import { test, expect } from "@playwright/test";

test("mounts the real Three.js renderer and ScrollTrigger, then cleans up", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/runtime-probe.html");
  await expect(page.locator("body")).toHaveAttribute("data-runtime", "ready");
  expect(await page.evaluate(() => ({
    scene: window.__probe.scene.isScene,
    renderer: window.__probe.renderer.isWebGLRenderer,
    trigger: window.__probe.trigger.vars.trigger.id,
  }))).toEqual({ scene: true, renderer: true, trigger: "lesson-section" });
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.waitForTimeout(50);
  expect(await page.evaluate(() => window.__probe.progress)).toBeGreaterThan(0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(50);
  expect(await page.evaluate(() => window.__probe.progress)).toBeLessThan(0.1);
  await page.setViewportSize({ width: 900, height: 700 });
  await page.evaluate(() => window.dispatchEvent(new Event("resize")));
  expect(await page.locator("#lesson-canvas").getAttribute("width")).toBe("640");
  await page.evaluate(() => window.__disposeProbe());
  await expect(page.locator("body")).toHaveAttribute("data-runtime", "disposed");
  expect(errors).toEqual([]);
});
