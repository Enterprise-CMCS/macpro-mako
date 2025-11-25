import "../src/index.css";

import type { Preview } from "@storybook/react-vite";
import { cognitoHandlers, defaultApiHandlers, launchDarklyHandlers } from "mocks";
import { initialize, mswLoader } from "msw-storybook-addon";

import { withLaunchDarkly, withQueryClient } from "./decorators";

// 🔹 Detect when we're running inside Vitest (storybook-addon-vitest)
const isVitest = typeof import.meta !== "undefined" && (import.meta as any).vitest;

// Only initialize MSW's service worker in real Storybook, NOT in Vitest
if (!isVitest) {
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
  // In Vitest, don't run the mswLoader at all
  loaders: isVitest ? [] : [mswLoader],
  tags: ["autodocs"],
  decorators: [withQueryClient, withLaunchDarkly],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    // Disable MSW handlers for Vitest so no SW / workerChannel logic runs
    ...(isVitest
      ? {}
      : {
          msw: {
            handlers: {
              auth: [...cognitoHandlers],
              api: [...defaultApiHandlers],
              flags: [...launchDarklyHandlers],
            },
          },
        }),

    a11y: {
      // Fail accessibility tests when violations are found
      test: "error",
    },

    html: {},
  },
};

export default preview;
