import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "email",
    root: "./lib/libs/email/content",
    exclude: ["**/node_modules/**"],
    environment: "jsdom",
  },
});
