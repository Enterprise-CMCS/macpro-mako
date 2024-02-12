import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Glob patterns to match test files
    include: ["**/*.{test,spec}.{ts,tsx}"],
    // Exclude e2e tests and node_modules
    exclude: ["**/node_modules/**", "**/e2e/**"],
  },
});
