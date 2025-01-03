import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "emails",
    include: ["**/*.test.tsx", "**/*.test.ts"],
    environment: "jsdom",
    maxConcurrency: 2,
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    pool: "threads",
    alias: {
      lib: path.resolve(__dirname, "../.."),
      libs: path.resolve(__dirname, "../libs"),
    },
    coverage: {
      enabled: true,
      provider: "v8",
      all: true,
      clean: true,
      reportsDirectory: "coverage/emails",
      reporter: ["text", "html", "json", "lcov", "json-summary"],
      extension: [".ts", ".tsx"],
      thresholds: {
        lines: 60,
        branches: 60,
        functions: 60,
        statements: 60,
      },
    },
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
  },
});
