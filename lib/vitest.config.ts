import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    root: ".",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["**/email/preview/**/*.test.tsx"],
    environment: "node",
  },
});
