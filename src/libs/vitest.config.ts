import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    reporters: "github-actions",
    coverage: {
      provider: "istanbul",
    },
  },
});
