import { configDefaults, defineConfig } from "vitest/config";
import { join } from "path";

export default defineConfig({
  test: {
    globals: true,
    environmentMatchGlobs: [
      ["**/*.test.ts", "node"],
      ["**/*.test.tsx", "jsdom"],
      ["!**/*.spec.*", "node"],
    ],
    setupFiles: ["./react-app/testing/setup.ts"],
    coverage: {
      provider: "istanbul",
      reportsDirectory: join(__dirname, "coverage"),
      reporter: ["html", "text", "json-summary", "json", "lcovonly"],
      reportOnFailure: true,
      exclude: [
        ...configDefaults.exclude,
        "./lib/config/deployment-config.test.ts",
        "./react-app/src/hooks/useDebounce.test.ts",
        "./react-app/src/hooks/useMediaQuery.test.ts",
        "./react-app/src/utils/buildStatusMemoQuery.test.ts",
        "./react-app/src/components/HowItWorks/index.test.tsx",
        "./react-app/src/components/SimplePageContainer/index.test.tsx",
        "./react-app/src/components/Inputs/upload.utilities.test.ts",
        "./react-app/src/components/Banner/index.test.tsx",
        "./react-app/src/hooks/useIdle.test.ts",
        "./react-app/src/hooks/useCountdown.test.ts",
        "./react-app/src/components/DependencyWrapper/index.test.tsx",
      ],
    },
    environment: "jsdom",
    deps: {
      inline: ["@react-email/components"],
    },
  },
});
