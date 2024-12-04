import { configDefaults, defineConfig } from "vitest/config";
import { join } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    environmentMatchGlobs: [
      ["**/*.test.tsx", "happy-dom"],
      ["**/*.test.ts", "happy-dom"],
    ],
    exclude: [
      ...configDefaults.exclude,
      "./react-app/src/components/HowItWorks/index.test.tsx",
      "./react-app/src/components/SimplePageContainer/index.test.tsx",
      "!**/*.spec.*",
      "!**/*.page.*",
    ],
    setupFiles: ["./react-app/testing/setup.ts"],
    coverage: {
      provider: "istanbul",
      reportsDirectory: join(__dirname, "coverage"),
      reporter: ["html", "text", "json-summary", "json", "lcovonly"],
      reportOnFailure: true,
    },
    deps: {
      inline: ["@react-email/components"],
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
});
