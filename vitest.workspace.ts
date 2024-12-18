import { defineWorkspace, defineProject } from "vitest/config";

// export default defineWorkspace([
//   defineProject({
//     root: "lib",
//     test: {
//       exclude: ["**/node_modules/**", "libs/email/content/**", "lib/libs/email"],
//       environment: "node",
//     },
//   }),
//   defineProject({
//     root: "lib/libs/email",
//     test: {
//       setupFiles: ["../../vitest.setup.ts"], // Adjust path if needed
//       exclude: ["**/node_modules/**"],
//       environment: "jsdom",
//     },
//   }),
// ]);
// import { defineWorkspace } from "vitest/config";

// defineWorkspace provides a nice type hinting DX
export default defineWorkspace(["react-app", "lib", "lib/libs/email"]);
