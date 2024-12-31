import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "emails",
    include: ["**/*.test.tsx", "**/*.test.ts"],
    environment: "jsdom",
    maxConcurrency: 2,
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
  },
});
