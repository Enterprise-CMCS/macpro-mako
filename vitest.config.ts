import { defineWorkspace, configDefaults } from "vitest/config";
import path from "path";

export default defineWorkspace([
  {
    test: {
      name: "libs",
      maxConcurrency: 2,
      include: ["lib/**/*.test.{ts,tsx}"],
      exclude: [
        ...configDefaults.exclude,
        "lib/libs/webforms/**",
        "lib/libs/email/**",
        "lib/local-constructs/**",
      ],
      environment: "node",
      globals: true,
      setupFiles: ["./lib/vitest.setup.ts"],
      pool: "threads",
      alias: {
        lib: path.resolve(__dirname, "./lib"),
        libs: path.resolve(__dirname, "./lib/libs"),
      },
      poolOptions: {
        threads: {
          singleThread: false,
        },
      },
    },
    build: {
      target: "esnext",
    },
    define: {
      "import.meta.vitest": "undefined",
    },
  },
  {
    test: {
      name: "react-app",
      include: ["./react-app/src/**/*.test.tsx", "react-app/src/**/*.test.ts"],
      exclude: ["./react-app/src/features/**"],
      environment: "jsdom",
      maxConcurrency: 2,
      globals: true,
      setupFiles: ["./react-app/vitest.setup.ts"],
      pool: "threads",
      poolOptions: {
        threads: {
          singleThread: false,
        },
      },
      alias: {
        "@": path.resolve(__dirname, "./react-app/src"),
      },
    },
  },
  {
    test: {
      name: "emails",
      include: ["lib/libs/email/**/*.test.tsx", "lib/libs/email/**/*.test.ts"],
      environment: "jsdom",
      maxConcurrency: 2,
      setupFiles: ["lib/libs/email/vitest.setup.ts"],
      globals: true,
      pool: "threads",
      poolOptions: {
        threads: {
          singleThread: false,
        },
      },
    },
  },
]);
