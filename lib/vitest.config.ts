import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    root: ".",
    setupFiles: ["./testing/setup.ts"],
    exclude: ["**/node_modules/**"],
    environment: "node",
  },
});
