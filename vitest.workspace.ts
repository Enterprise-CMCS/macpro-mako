import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    include: ["**/*.test.{ts,tsx}"],
    exclude: [
      ".build_run",
      ".cdk",
      "lib/libs/webforms/**",
      "react-app/src/features/webforms/**",
      "**/TestWrapper.tsx",
      "lib/stacks",
      "lib/local-aspects",
      "lib/local-constructs",
      "bin",
      "vitest.workspace.ts",
      "**/*.config.{ts,js,cjs}",
      "**/coverage/**",
      "test/e2e",
      "mocks",
      "react-app/src/assets",
      "node_modules",
      "**/node_modules",
    ],
    // Server-side tests configuration
    test: {
      name: "libs",
      environment: "node",
      globals: true,
      setupFiles: ["./lib/vitest.setup.ts"],
      pool: "threads",
      poolOptions: {
        threads: {
          singleThread: false,
        },
      },
    },
  },
  {
    // React application tests configuration
    test: {
      name: "react-app",
      include: ["react-app/src/**/*.test.{ts,tsx}"],
      exclude: ["react-app/src/features/webforms/**"],
      environment: "jsdom",
      globals: true,
      setupFiles: ["./react-app/vitest.setup.ts"],
      pool: "threads", // Use threading for better performance
      poolOptions: {
        threads: {
          singleThread: false,
        },
      },
    },
  },
  {
    test: {
      name: "emails",
      include: ["lib/libs/email/**/*.test.{ts,tsx}"],
      environment: "jsdom",
      setupFiles: ["./react-app/vitest.setup.ts"],
      globals: true,
      pool: "threads", // Use threading for better performance
      poolOptions: {
        threads: {
          singleThread: false,
        },
      },
    },
  },
]);
