import { defineWorkspace } from "vitest/config";
import { join } from "path";
import react from "@vitejs/plugin-react-swc";

export default defineWorkspace([
  {
    test: {
      name: "react-app",
      root: "./react-app",
      environment: "jsdom",
      setupFiles: ["./vitest.setup.ts"],
      include: ["**/*.test.{ts,tsx}"],
      globals: true,
      alias: {
        "@": join(__dirname, "react-app/src"),
      },
      deps: {
        inline: ["vitest-canvas-mock"],
      },
    },
    plugins: [react()],
  },
  {
    test: {
      name: "lib",
      root: "./lib",
      environment: "node",
      setupFiles: ["./vitest.setup.ts"],
      include: ["**/*.test.{ts,tsx}"],
      globals: true,
    },
  },
  {
    test: {
      name: "email",
      root: "./lib/libs/email",
      environment: "node",
      setupFiles: ["./vitest.setup.ts"],
      include: ["**/*.test.{ts,tsx}"],
      globals: true,
    },
  },
]);
