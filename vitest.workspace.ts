import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    root: "./react-app",
    test: {
      environment: "jsdom",
      setupFiles: ["./react-app/vitest.setup.ts"],
      include: ["**/*.{test}.{ts,tsx}"],
    },
  },
  {
    root: "./lib",
    test: {
      environment: "node",
      setupFiles: ["./vitest.setup.ts"],
      include: ["**/*.{test}.{ts,tsx}"],
    },
  },
  {
    root: "./lib/libs/email",
    test: {
      environment: "node",
      setupFiles: ["./lib/libs/email/vitest.setup.ts"],
      include: ["**/*.{test}.{ts,tsx}"],
    },
  },
]);
