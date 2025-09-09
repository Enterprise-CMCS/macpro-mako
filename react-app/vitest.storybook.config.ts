import path from "node:path";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./.storybook/vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    plugins: [
      storybookTest({
        configDir: path.join(__dirname, ".storybook"),
        // This should match your package.json script to run Storybook
        // The --ci flag will skip prompts and not open a browser
        storybookScript: "bun storybook --ci",
      }),
    ],
    test: {
      setupFiles: "./.storybook/vitest.setup.ts",
      reporters: ["default", "html", "json", "github-actions"],
      outputFile: {
        html: "../accessibility/html-report/index.html",
        json: "../accessibility/json-report.json",
      },
    },
  }),
);
