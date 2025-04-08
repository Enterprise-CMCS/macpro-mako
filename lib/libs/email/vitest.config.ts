import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "email",
    root: "lib/libs/email/",
    setupFiles: ["vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**"],
    environment: "jsdom",
  },
});
