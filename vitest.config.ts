import { configDefaults, defineConfig } from "vitest/config";
import { join } from "path";

export default defineConfig({
  test: {
    globals: true,
    environmentMatchGlobs: [["**/*.test.ts", "**/*.test.tsx"]],
    setupFiles: ["./react-app/testing/setup.ts"],
    coverage: {
      provider: "istanbul",
      reportsDirectory: join(__dirname, "coverage"),
      reporter: ["html", "text", "json-summary", "json", "lcovonly"],
      reportOnFailure: true,
      exclude: [...configDefaults.exclude],
    },
  },
});
