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
        ".build_run",
        "build_run",
        ".cdk",
        "docs",
        "lib/libs/webforms",
        "lib/packages/eslint-config-custom",
        "lib/packages/eslint-config-custom-server",
        "bin/cli",
        "vitest.workspace.ts",
        "**/*/.eslintrc.{ts,js,cjs}",
        "**/*.config.{ts,js,cjs}",
        "test",
      ],
    },
  },
});
