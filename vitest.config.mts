import { join } from "path";
import { configDefaults, defineConfig } from "vitest/config";
import { EventEmitter } from "events";

EventEmitter.defaultMaxListeners = 100;

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
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
        "lib/libs/webforms/**",
        "react-app/**",
        "**/*/TestWrapper.tsx",
        "lib/stacks/**",
        "lib/local-aspects",
        "lib/local-constructs/**",
        "bin/cli/**",
        "bin/app.ts",
        "vitest.workspace.ts",
        "**/*/.eslintrc.{ts,js,cjs}",
        "**/*.config.{ts,js,cjs}",
        "**/coverage/**",
        "test/e2e/**",
        "mocks/**",
        "**/*.js",
        "**/assets/**",
        "node_modules/**",
        "**/node_modules/**",
      ],
    },
  },
});
