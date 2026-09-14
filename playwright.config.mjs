import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30000,
  reporter: "line",
  use: { baseURL: "http://127.0.0.1:4177", headless: true },
  webServer: {
    command: "node tests/e2e/server.mjs",
    url: "http://127.0.0.1:4177/runtime-probe.html",
    reuseExistingServer: false,
    timeout: 30000,
  },
});
