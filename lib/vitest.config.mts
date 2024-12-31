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
