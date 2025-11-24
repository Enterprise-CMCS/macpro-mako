import "../src/index.css";

import type { Preview } from "@storybook/react-vite";
import { cognitoHandlers, defaultApiHandlers, launchDarklyHandlers } from "mocks";
import { initialize, mswLoader } from "msw-storybook-addon";

import { withLaunchDarkly, withQueryClient } from "./decorators";

// Decide when to disable MSW
// - In non-browser environments (no window), don't initialize
// - In CI a11y pipeline, set STORYBOOK_DISABLE_MSW="true"
const disableMsw =
  typeof window === "undefined" || (import.meta as any).env?.STORYBOOK_DISABLE_MSW === "true";

if (!disableMsw) {
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
  // Only attach the MSW loader when MSW is enabled
  loaders: disableMsw ? [] : [mswLoader],

  //👇 Enables auto-generated documentation for all stories
  tags: ["autodocs"],
  decorators: [withQueryClient, withLaunchDarkly],

  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    // Only register MSW handlers when enabled
    msw: disableMsw
      ? undefined
      : {
          handlers: {
            auth: [...cognitoHandlers],
            api: [...defaultApiHandlers],
            flags: [...launchDarklyHandlers],
          },
        },

    a11y: {
      // Fail all accessibility tests when violations are found
      test: "error",
    },

    html: {},
  },
};

export default preview;
