import path from "node:path";
import { fileURLToPath } from "node:url";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./vite.config";

const dirname =
  typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default mergeConfig(
  viteConfig({ command: "serve", mode: "test" }),
  defineConfig({
    plugins: [
      storybookTest({
        // This should match your package.json script to run Storybook
        // The --ci flag will skip prompts and not open a browser
        storybookScript: "bun storybook --ci",
      }),
    ],
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
);
