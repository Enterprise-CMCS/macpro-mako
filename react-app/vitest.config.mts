import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    name: "react-app",
    include: ["./src/**/*.test.tsx", "./src/**/*.test.ts"],
    exclude: ["./src/features/**"],
    environment: "jsdom",
    maxConcurrency: 2,
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    pool: "threads",
    coverage: {
      enabled: true,
      provider: "v8",
      all: true,
      clean: true,
      reportsDirectory: "coverage/react-app",
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
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
