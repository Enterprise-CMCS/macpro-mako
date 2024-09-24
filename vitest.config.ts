import { defineConfig, configDefaults } from "vitest/config";
import { join } from "path";

export default defineConfig({
  test: {
    include: ["**/*.test.{ts,tsx}"],
    coverage: {
      provider: "istanbul",
      reportsDirectory: join(__dirname, "coverage"),
      reporter: ["html", "text", "json-summary", "json", "lcovonly"],
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
        "bin/app.ts",
        "vitest.workspace.ts",
        "**/*/.eslintrc.{ts,js,cjs}",
        "**/*.config.{ts,js,cjs}",
        "**/*.spec.ts",
        "test/e2e",
        "**/e2e/**",
      ],
    },
  },
});
