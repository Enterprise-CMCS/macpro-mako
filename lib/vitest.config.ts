import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    root: "lib/",
    exclude: ["**/node_modules/**", "libs/email/content/**"],
    environment: "node",
  },
});
