import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    root: ".",
    setupFiles: ["./vitest.setup.ts"],
    exclude: ["**/node_modules/**", "libs/email/content/**"],
    environment: "node",
  },
});
