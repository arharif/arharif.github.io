import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:4174",
    headless: true,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        launchOptions: {
          executablePath:
            process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
            (!process.env.CI && existsSync("/usr/bin/chromium")
              ? "/usr/bin/chromium"
              : undefined),
          args: ["--no-sandbox"],
        },
      },
    },
    ...(process.env.X1_ALL_BROWSERS === "1"
      ? [
          { name: "firefox", use: { browserName: "firefox" as const } },
          { name: "webkit", use: { browserName: "webkit" as const } },
        ]
      : []),
  ],
  webServer: {
    command: "node scripts/serve-pages.mjs",
    port: 4174,
    reuseExistingServer: !process.env.CI,
  },
});
