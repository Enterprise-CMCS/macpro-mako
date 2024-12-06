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
    setupFiles: ["./react-app/testing/setup.ts"],
    coverage: {
      provider: "istanbul",
      reportsDirectory: join(__dirname, "coverage"),
      reporter: ["html", "text", "json-summary", "json", "lcovonly"],
      reportOnFailure: true,
    },
    exclude: [
      ...configDefaults.exclude,
      "./react-app/src/components/HowItWorks/index.test.tsx",
      "./react-app/src/components/SimplePageContainer/index.test.tsx",
      "**/*.spec.*",
      "**/*.page.*",
      ".build_run",
      "build_run",
      ".cdk",
      "docs/**",
      "lib/libs/webforms/**",
      "react-app/src/features/webforms/**",
      "TestWrapper.tsx",
      "lib/stacks/**",
      "lib/packages/eslint-config-custom/**",
      "lib/packages/eslint-config-custom-server/**",
      "lib/local-aspects",
      "lib/local-constructs/**",
      "lib/libs/email/content/**",
      "bin/cli/**",
      "bin/app.ts",
      "vitest.workspace.ts",
      "**/*/.eslintrc.{ts,js,cjs}",
      "**/*.config.{ts,js,cjs}",
      "**/coverage/**",
      "test/e2e/**",
      "**/*.js",
      "**/assets/**",
      "node_modules/**",
    ],
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
