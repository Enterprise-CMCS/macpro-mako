import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { cpus } from "os";
import { join } from "path";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**", "test/**", "**/*.spec.{ts,tsx}"],
    projects: [
      {
        test: {
          name: "lib",
          root: "./lib/",
          setupFiles: ["vitest.setup.ts"],
          exclude: ["**/node_modules/**", "./libs/email/**"],
          environment: "node",
        },
      },
      {
        test: {
          name: "email",
          root: "./lib/libs/email/",
          setupFiles: ["vitest.setup.ts"],
          exclude: ["**/node_modules/**"],
          environment: "jsdom",
        },
      },
      {
        extends: "./react-app/vite.config.ts",
        test: {
          name: "ui",
          root: "./react-app",
          setupFiles: "vitest.setup.ts",
          exclude: ["**/node_modules/**"],
          environment: "jsdom",
        },
      },
      {
        extends: "./react-app/vite.config.ts",
        plugins: [
          storybookTest({
            configDir: "./.storybook",
            // This should match your package.json script to run Storybook
            // The --ci flag will skip prompts and not open a browser
            storybookScript: "run storybook --ci",
          }),
        ],
        test: {
          name: "storybook",
          root: "./react-app",
          exclude: ["**/*.test.{ts,tsx}", "**/*.mdx"],
          browser: {
            enabled: true,
            provider: "playwright",
            headless: true,
            // https://vitest.dev/guide/browser/playwright
            instances: [{ browser: "chromium" }],
          },
          setupFiles: "./.storybook/vitest.setup.ts",
        },
      },
    ],
    server: {
      deps: {
        cacheDir: ".vitest/cache",
      },
    },
    testTimeout: 10000,
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: true,
        maxThreads: Math.max(1, Math.floor(cpus().length * 0.75)),
        minThreads: Math.max(1, Math.floor(cpus().length * 0.5)),
      },
    },
    coverage: {
      provider: "istanbul",
      reportsDirectory: join(__dirname, "coverage"),
      reporter: [
        ["html", { subdir: "html-report" }],
        ["text"],
        ["json-summary"],
        ["json"],
        ["lcovonly"],
      ],
      thresholds: {
        lines: 90,
        branches: 80,
        functions: 85,
        statements: 90,
      },
      reportOnFailure: true,
      exclude: [
        ...configDefaults.exclude,
        ".build_run",
        "build_run",
        ".cdk",
        ".github",
        ".turbo",
        ".vitest",
        ".vscode",
        "bin/app.ts",
        "bin/cli/**",
        "coverage",
        "docs/**",
        "lib/libs/email/mock-data/**",
        "lib/libs/webforms/**",
        "lib/local-aspects",
        "lib/local-constructs/**",
        "lib/packages/eslint-config-custom/**",
        "lib/packages/eslint-config-custom-server/**",
        "lib/stacks/**",
        "mocks/**",
        "node_modules/**",
        "**/node_modules/**",
        "react-app/.storybook/**",
        "react-app/src/components/ScrollToTop/**",
        "react-app/src/features/webforms/**",
        "react-app/src/main.tsx",
        "react-app/src/utils/test-helpers/**",
        "test/**",
        "vitest.config.ts",
        "vitest.workspace.ts",
        "**/*/.eslintrc.{ts,js,cjs}",
        "**/*.config.{ts,js,cjs}",
        "**/*.js",
        "**/*.json",
        "**/*.mdx",
        "**/*.stories.ts",
        "**/*.stories.tsx",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/assets/**",
        "**/coverage/**",
        "**/vitest.setup.ts",
        "**/vitest.config.ts",
        "**/legacy-package-view.ts",
        "**/legacy-admin-change.ts",
        "**/legacy-event.ts",
        "**/legacy-shared.ts",
      ],
    },
  },
});
