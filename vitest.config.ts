import { defineConfig } from "vitest/config";
import { join } from "path";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reportsDirectory: join(__dirname, "coverage"),
      reporter: ["text", "json-summary", "json", "lcov"],
      reportOnFailure: true,
    },
  },
});
