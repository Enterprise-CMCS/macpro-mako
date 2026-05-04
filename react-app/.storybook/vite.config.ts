import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "../vite.config";

export default (async () =>
  mergeConfig(
    await viteConfig({ command: "serve", mode: "test" }),
    defineConfig({
      resolve: {
        dedupe: ["msw"],
      },
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
        server: {
          deps: {
            inline: ["@aws/lambda-invoke-store", "@aws-sdk/middleware-recursion-detection"],
          },
        },
      },
    }),
  ))();
