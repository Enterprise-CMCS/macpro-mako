import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    root: "lib/",
    setupFiles: ["vitest.setup.ts"],
    exclude: ["**/node_modules/**", "libs/email/**"],
    environment: "node",
  },
});
