import { configDefaults, defineWorkspace } from "vitest/config";
// import "@testing-library/jest-dom";
import path from "path";

export default defineWorkspace([
  {
    test: {
      name: "libs",
      include: ["lib/**/*.test.{ts,tsx}"],
      exclude: [
        ...configDefaults.exclude,
        // ".build_run",
        // ".cdk",
        "lib/libs/webforms/**",
        "lib/libs/email/**",
        "lib/local-constructs/**",
        // "react-app/src/features/webforms/**",
        // "**/TestWrapper.tsx",
        // "lib/stacks",
        // "lib/local-aspects",
        // "bin",
        // "vitest.workspace.ts",
        // "**/*.config.{ts,js,cjs}",
        // "**/coverage/**",
        // "test/e2e",
        // "mocks",
        // "react-app/src/assets",
        // "node_modules",
        // "**/node_modules",
      ],
      // Server-side tests configuration
      environment: "node",
      globals: true,
      setupFiles: ["./lib/vitest.setup.ts"],
      pool: "threads",
      alias: {
        // Add path aliases to match your imports
        lib: path.resolve(__dirname, "./lib"),
        libs: path.resolve(__dirname, "./lib/libs"),
      },
      poolOptions: {
        threads: {
          singleThread: false,
        },
      },
    },
  },
  // {
  //   // React application tests configuration
  //   test: {
  //     name: "react-app",
  //     include: ["react-app/src/**/*.test.{ts,tsx}"],
  //     exclude: ["react-app/src/features/webforms/**"],
  //     environment: "jsdom",
  //     globals: true,
  //     setupFiles: ["./react-app/vitest.setup.ts"],
  //     pool: "threads",
  //     poolOptions: {
  //       threads: {
  //         singleThread: false,
  //       },
  //     },
  //   },
  // },
  // {
  //   test: {
  //     name: "emails",
  //     include: ["lib/libs/email/**/*.test.{ts,tsx}"],
  //     environment: "jsdom",
  //     setupFiles: ["./react-app/vitest.setup.ts"],
  //     globals: true,
  //     pool: "threads",
  //     poolOptions: {
  //       threads: {
  //         singleThread: false,
  //       },
  //     },
  //   },
  // },
]);
