import type { Preview } from "@storybook/react-vite";
import { initialize } from "msw-storybook-addon";
import { cognitoHandlers, defaultApiHandlers, launchDarklyHandlers } from "mocks";

import "../src/index.css";

initialize(
  {
    onUnhandledRequest: "bypass",
  },
  [...cognitoHandlers, ...defaultApiHandlers, ...launchDarklyHandlers],
);

const preview: Preview = {
  // ...rest of preview
  //👇 Enables auto-generated documentation for all stories
  tags: ["autodocs"],
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
