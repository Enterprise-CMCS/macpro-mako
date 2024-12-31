import { defineConfig } from "vitest/config";
import path from "path";
export default defineConfig({
  test: {
    name: "react-app",
    include: ["./src/**/*.test.tsx", "./src/**/*.test.ts"],
    exclude: ["./src/features/**"],
    environment: "jsdom",
    maxConcurrency: 2,
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
