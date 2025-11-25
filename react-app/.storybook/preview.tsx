import "../src/index.css";

import type { Preview } from "@storybook/react-vite";
import { cognitoHandlers, defaultApiHandlers, launchDarklyHandlers } from "mocks";
import { initialize, mswLoader } from "msw-storybook-addon";

import { withLaunchDarkly, withQueryClient } from "./decorators";

// Detect Vitest (storybook-addon-vitest)
const isVitest = typeof import.meta !== "undefined" && (import.meta as any).vitest;

// Detect Storybook test-runner (a11y pipeline / playwright)
const isStorybookTestRunner =
  typeof window !== "undefined" && (window as any).__STORYBOOK_TEST_RUNNER__;

// We only want MSW's service worker in *real* Storybook UI
const shouldUseMsw = !isVitest && !isStorybookTestRunner;

if (shouldUseMsw) {
  initialize({
    onUnhandledRequest: "bypass",
    serviceWorker: {
      options: {
        updateViaCache: "none",
      },
    },
  });
}

const preview: Preview = {
  loaders: shouldUseMsw ? [mswLoader] : [],
  tags: ["autodocs"],
  decorators: [withQueryClient, withLaunchDarkly],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    ...(shouldUseMsw
      ? {
          msw: {
            handlers: {
              auth: [...cognitoHandlers],
              api: [...defaultApiHandlers],
              flags: [...launchDarklyHandlers],
            },
          },
        }
      : {}),

    a11y: {
      test: "error",
    },

    html: {},
  },
};

export default preview;
