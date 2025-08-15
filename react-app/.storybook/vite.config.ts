import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "../vite.config";

export default mergeConfig(
  viteConfig({ command: "serve", mode: "test" }),
  defineConfig({
    test: {
      globals: true,
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
    },
  }),
);
