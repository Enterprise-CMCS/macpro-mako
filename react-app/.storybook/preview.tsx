import "../src/index.css";

import type { Preview } from "@storybook/react-vite";
import { cognitoHandlers, defaultApiHandlers, launchDarklyHandlers } from "mocks";
import { initialize, mswLoader } from "msw-storybook-addon";

import { withLaunchDarkly, withQueryClient } from "./decorators";

const isVitest = typeof import.meta !== "undefined" && (import.meta as any).vitest;

// Storybook test runner flag (Playwright-based a11y/test-runner)
const isStorybookTestRunner =
  (typeof window !== "undefined" && (window as any).__STORYBOOK_TEST_RUNNER__) ||
  (typeof globalThis !== "undefined" && (globalThis as any).__STORYBOOK_TEST_RUNNER__);

// Explicit CI/test env flag you can set in your a11y pipeline
// e.g. STORYBOOK_TEST=true
const isStorybookTestEnv =
  typeof process !== "undefined" && process.env && process.env.STORYBOOK_TEST === "true";

const isBrowser = typeof window !== "undefined" && typeof navigator !== "undefined";

// Only use MSW when:
// - real browser
// - has serviceWorker
// - NOT Vitest
// - NOT Storybook test runner
// - NOT our explicit STORYBOOK_TEST env
const shouldUseMsw =
  isBrowser &&
  "serviceWorker" in navigator &&
  !isVitest &&
  !isStorybookTestRunner &&
  !isStorybookTestEnv;

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
  // Only attach mswLoader when we actually use MSW
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

    // Only register MSW handlers when enabled
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
      // Fail on violations in both normal Storybook and test runner
      test: "error",
    },
    html: {},
  },
};

export default preview;
