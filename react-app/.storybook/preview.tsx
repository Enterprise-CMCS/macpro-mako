import "../src/index.css";

import type { Preview } from "@storybook/react-vite";
import { cognitoHandlers, defaultApiHandlers, launchDarklyHandlers } from "mocks";
import { initialize, mswLoader } from "msw-storybook-addon";

import { withLaunchDarkly, withQueryClient } from "./decorators";

const isVitest = typeof import.meta !== "undefined" && (import.meta as any).vitest;

// Only initialize MSW's service worker when running real Storybook,
// NOT when Storybook preview is being pulled into Vitest a11y tests.
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

    // Disable MSW story handlers entirely when in Vitest a11y runs.
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
      test: "error",
    },

    html: {},
  },
};

export default preview;
