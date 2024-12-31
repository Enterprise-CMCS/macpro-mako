import { defineConfig } from "vitest/config";
import path from "path";
import { configDefaults } from "vitest/config";

export default defineConfig({
  test: {
    name: "libs",
    maxConcurrency: 2,
    include: ["**/*.test.{ts,tsx}"],
    exclude: [
      ...configDefaults.exclude,
      "./libs/webforms/**",
      "./libs/email/**",
      "./local-constructs/**",
    ],
    environment: "node",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    pool: "threads",
    alias: {
      lib: path.resolve(__dirname, "./"),
      libs: path.resolve(__dirname, "./lib/libs"),
    },
    coverage: {
      enabled: true,
      provider: "v8",
      all: true,
      clean: true,
      reportsDirectory: "coverage/libs",
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
  build: {
    target: "esnext",
  },
  define: {
    "import.meta.vitest": "undefined",
  },
});
