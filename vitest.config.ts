import { defineConfig, configDefaults } from "vitest/config";
import { join } from "path";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reportsDirectory: join(__dirname, "coverage"),
      reporter: ["html", "text", "json-summary", "json", "lcov"],
      reportOnFailure: true,
      exclude: [
        ...configDefaults.exclude,
        "docs",
        "src/services/api/webforms",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
        "build_run",
      ],
    },
  },
});
