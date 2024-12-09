import { defineWorkspace } from "vitest/config";

// defineWorkspace provides a nice type hinting DX
// export default defineWorkspace(["react-app", "lib"]);
export default defineWorkspace([
  {
    extends: "./vitest.config.ts",
    test: {
      name: "react-app",
      include: ["react-app/**/*.test.{ts,tsx}"],
      setupFiles: ["./react-app/testing/setup.ts"],
      environment: "happy-dom",
    },
  },
  {
    extends: "./vitest.config.ts",
    test: {
      name: "lib",
      include: ["lib/**/*.test.ts"],
      setupFiles: ["./lib/testing/setup.ts"],
      environment: "node",
    },
  },
]);

// environmentMatchGlobs: [["**/*.test.ts", "**/*.test.tsx"]],
//     setupFiles: ["./react-app/testing/setup.ts"],
