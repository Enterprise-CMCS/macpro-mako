import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "../vite.config";

export default defineConfig((configEnv) =>
  mergeConfig(
    viteConfig({ ...configEnv, mode: "test" }),
    defineConfig({
      test: {
        globals: true,
        name: "storybook",
        exclude: [
          "**/node_modules",
          "**/*.test.{ts,tsx}",
          "test/**",
          "**/.spec.{ts,tsx}",
          "**/*.mdx",
        ],
        browser: {
          enabled: true,
          provider: "playwright",
          headless: true,
          // https://vitest.dev/guide/browser/playwright
          instances: [{ browser: "chromium" }],
        },
        setupFiles: "./.storybook/vitest.setup.ts",
      },
    }),
  ),
);
