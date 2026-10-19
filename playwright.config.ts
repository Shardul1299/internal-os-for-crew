import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";

const port = 3100;
const exe = process.env.PW_CHROMIUM ?? (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);

// Acceptance paths from BRIEF §15. Runs against a production build on a seeded database
// (pnpm db:reset && pnpm db:demo && pnpm build). Dev sign-in is forced on for the test server only.
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  workers: 1,
  fullyParallel: false,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${port}`, launchOptions: { executablePath: exe }, trace: "retain-on-failure" },
  webServer: {
    command: `pnpm start -p ${port}`,
    url: `http://localhost:${port}/signin`,
    reuseExistingServer: true,
    timeout: 120_000,
    env: { AUTH_URL: `http://localhost:${port}`, DEV_LOGIN: "force" },
  },
});
