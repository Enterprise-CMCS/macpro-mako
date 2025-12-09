import "../src/index.css";

import type { Preview } from "@storybook/react-vite";
import { cognitoHandlers, defaultApiHandlers, launchDarklyHandlers } from "mocks";
import { initialize, mswLoader } from "msw-storybook-addon";

// import * as React from "react";
import { withLaunchDarkly, withQueryClient } from "./decorators";
initialize({
  onUnhandledRequest: "bypass",
  serviceWorker: {
    url: "/mockServiceWorker.js",
    options: {
      updateViaCache: "none",
    },
  },
});

const preview: Preview = {
  // Provide the MSW addon loader globally
  loaders: [mswLoader],
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
    msw: {
      handlers: {
        auth: [...cognitoHandlers],
        api: [...defaultApiHandlers],
        flags: [...launchDarklyHandlers],
      },
    },

    a11y: {
      // 👇 Fail all accessibility tests when violations are found
      test: "error",
    },

    html: {},
  },
};

export default preview;
