import "../src/index.css";

import type { Preview } from "@storybook/react-vite";
import axios from "axios";
import { cognitoHandlers, defaultApiHandlers, launchDarklyHandlers } from "mocks";
import { initialize, mswLoader } from "msw-storybook-addon";

import { withLaunchDarkly, withQueryClient } from "./decorators";

const isTestRunner =
  typeof window !== "undefined" && (window as any).__STORYBOOK_TEST_RUNNER__ && navigator?.webdriver;

if (!isTestRunner) {
  initialize({
    onUnhandledRequest: "bypass",
    serviceWorker: {
      options: {
        updateViaCache: "none",
      },
    },
  });
} else {
  // In the Vitest/Storybook test runner, short-circuit axios to avoid real fetches/MSW worker errors.
  axios.defaults.adapter = async (config) => ({
    data: {},
    status: 200,
    statusText: "OK",
    headers: {},
    config,
  });
}

const preview: Preview = {
  // Provide the MSW addon loader globally (skip in test runner)
  loaders: isTestRunner ? [] : [mswLoader],
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
    ...(isTestRunner
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
      // 👇 Fail all accessibility tests when violations are found
      test: "error",
    },

    html: {},
  },
};

export default preview;
