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
        "build_run",
        "docs",
        "src/services/api/webforms",
        "src/packages/eslint-config-custom",
        "src/packages/eslint-config-custom-server",
        "src/cli",
        "vitest.workspace.ts",
        "**/*/.eslintrc.{ts,js,cjs}",
        "**/*.config.{ts,js,cjs}",
        "src/services/ui/e2e",
      ],
    },
  },
});
