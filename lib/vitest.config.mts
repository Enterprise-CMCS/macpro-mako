import { defineProject } from "vitest/config";
import { EventEmitter } from "events";

EventEmitter.defaultMaxListeners = Infinity;

export default defineProject({
  test: {
    root: ".",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.ts", "**/*.test.tsx"],
    environment: "node",
  },
});
