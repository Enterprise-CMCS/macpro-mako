import "../src/index.css";

import type { Preview } from "@storybook/react-vite";
import { cognitoHandlers, defaultApiHandlers, launchDarklyHandlers } from "mocks";
import { initialize, mswLoader } from "msw-storybook-addon";

import { withQueryClient } from "./decorators";

initialize(
  {
    onUnhandledRequest: "bypass",
  },
  [...cognitoHandlers, ...defaultApiHandlers, ...launchDarklyHandlers],
);

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

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
};

export default preview;
