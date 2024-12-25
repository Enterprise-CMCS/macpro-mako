import { join } from "path";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,

    environmentMatchGlobs: [
      ["src/**/*.test.ts?(x)", "jsdom"],
      ["lib/libs/email/**/*.test.ts?(x)", "jsdom"],
      ["src/**/*.test.ts?(x)", "node"],
      ["lib/libs/**/*.test.ts?(x)", "node"],
      ["lib/**/*.test.ts?(x)", "node"],
    ],
    setupFiles: ["./lib/vitest.setup.ts"],
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
        "docs/**",
        "react-app/src/features/webforms/**",
        "**/*TestWrapper.tsx",
        "lib/stacks/**",
        "lib/packages/eslint-config-custom/**",
        "lib/packages/eslint-config-custom-server/**",
        "lib/local-aspects",
        "lib/local-constructs/**",
        "bin/cli/**",
        "bin/app.ts",
        "vitest.workspace.ts",
        "**/*/.eslintrc.{ts,js,cjs}",
        "**/*.config.{ts,tsx,js,cjs}",
        "**/coverage/**",
        "test/e2e/**",
        "mocks/**",
        "**/*.js",
        "**/assets/**",
        "node_modules",
        "**/node_modules/**",
      ],
    },
  },
});
