import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  use: { baseURL: "http://localhost:3100", launchOptions: { executablePath: process.env.PW_CHROMIUM || undefined } },
  webServer: {
    command: "pnpm start -p 3100",
    url: "http://localhost:3100/signin",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
