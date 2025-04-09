import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    root: "lib/",
    setupFiles: ["vitest.setup.ts"],
    exclude: ["libs/email/**"],
    environment: "node",
  },
});
