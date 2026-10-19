import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, ".") } },
  test: { include: ["tests/rules/**/*.test.ts", "tests/unit/**/*.test.ts"], environment: "node" },
});
