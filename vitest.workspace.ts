import { defineWorkspace } from "vitest/config";
import { join } from "path";
import react from "@vitejs/plugin-react-swc";

export default defineWorkspace([
  {
    root: "./react-app",
    extends: "./react-app/vite.config.mts",
    plugins: [react()],
    resolve: {
      alias: {
        "@": join(__dirname, "react-app/src"),
      },
    },
    test: {
      name: "react-app",
      environment: "jsdom",
      setupFiles: ["./vitest.setup.ts"],
      include: ["**/*.test.{ts,tsx}"],
      globals: true,
      deps: {
        inline: ["vitest-canvas-mock"],
      },
    },
  },
  {
    root: "./lib",
    test: {
      name: "lib",
      environment: "node",
      setupFiles: ["./vitest.setup.ts"],
      include: ["**/*.test.{ts,tsx}"],
      globals: true,
    },
  },
  {
    root: "./lib/libs/email",
    test: {
      name: "email",
      environment: "node",
      setupFiles: ["./vitest.setup.ts"],
      include: ["**/*.test.{ts,tsx}"],
      globals: true,
    },
  },
]);
