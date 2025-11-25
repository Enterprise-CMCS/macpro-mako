import "../src/index.css";

import type { Preview } from "@storybook/react-vite";
import { cognitoHandlers, defaultApiHandlers, launchDarklyHandlers } from "mocks";
import { initialize, mswLoader } from "msw-storybook-addon";

import { withLaunchDarkly, withQueryClient } from "./decorators";

const isVitest = typeof import.meta !== "undefined" && (import.meta as any).vitest;

const isStorybookTestRunner =
  typeof window !== "undefined" && (window as any).__STORYBOOK_TEST_RUNNER__;

// Only use MSW when:
// - we have a real window
// - we have navigator.serviceWorker (real browser)
// - NOT Vitest
// - NOT Storybook test runner
const shouldUseMsw =
  typeof window !== "undefined" &&
  typeof navigator !== "undefined" &&
  "serviceWorker" in navigator &&
  !isVitest &&
  !isStorybookTestRunner;

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
