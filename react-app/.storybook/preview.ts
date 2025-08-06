import "../src/index.css";

import type { Preview } from "@storybook/react-vite";
import { cognitoHandlers, defaultApiHandlers, launchDarklyHandlers } from "mocks";
import { initialize, mswLoader } from "msw-storybook-addon";

import { withQueryClient } from "./decorators";

initialize({
  onUnhandledRequest: "bypass",
});

const preview: Preview = {
  // Provide the MSW addon loader globally
  loaders: [mswLoader],
  //👇 Enables auto-generated documentation for all stories
  tags: ["autodocs"],
  decorators: [withQueryClient],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    msw: {
      handlers: [...cognitoHandlers, ...defaultApiHandlers, ...launchDarklyHandlers],
    },

    a11y: {
      context: {
        include: ["body"],
      },
      // 👇 Fail all accessibility tests when violations are found
      test: "error",
    },
  },
};

export default preview;
