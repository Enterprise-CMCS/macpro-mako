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
        "src/utils/TestWrapper.tsx",
        "**/*.config.{ts,js,cjs}",
        "**/*.js",
        "**/*.json",
        "public/**",
        "src/assets/**",
        "node_modules",
        ".env*",
        ".gitignore",
      ],
    },
  },
});
