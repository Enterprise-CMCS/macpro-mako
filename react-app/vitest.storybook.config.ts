import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./vite.config";

export default defineConfig((configEnv) =>
  mergeConfig(
    viteConfig({ ...configEnv, mode: "test" }),
    defineConfig({
      extends: "./.storybook/vite.config.ts",
      plugins: [
        storybookTest({
          // The location of your Storybook config, main.js|ts
          configDir: "./.storybook/",
          // This should match your package.json script to run Storybook
          // The --ci flag will skip prompts and not open a browser
          storybookScript: "bun storybook --ci",
        }),
      ],
    }),
  ),
);
