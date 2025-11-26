import "../src/index.css";

import type { Preview } from "@storybook/react-vite";
import axios from "axios";
import { cognitoHandlers, defaultApiHandlers, launchDarklyHandlers } from "mocks";
import { initialize, mswLoader } from "msw-storybook-addon";

import { MemoryRouter, Route, Routes } from "react-router";

import { withLaunchDarkly, withQueryClient } from "./decorators";

const isVitest = typeof import.meta !== "undefined" && (import.meta as any).vitest;
const isStorybookTestRunner =
  typeof window !== "undefined" && (window as any).__STORYBOOK_TEST_RUNNER__;
const isAutomation = typeof navigator !== "undefined" && navigator.webdriver;

// Force axios to use the legacy XHR adapter (axios 1.7+ defaults to fetch).
axios.defaults.adapter = require("axios/lib/adapters/xhr");

// 🔹 Build-time flag from CI to totally disable MSW in Storybook
const isMswDisabled =
  typeof import.meta !== "undefined" && (import.meta as any).env?.STORYBOOK_DISABLE_MSW === "true";

// Only use MSW when:
// - we have a real window
// - we have navigator.serviceWorker
// - NOT Vitest
// - NOT explicitly disabled via env
const shouldUseMsw =
  typeof window !== "undefined" &&
  typeof navigator !== "undefined" &&
  "serviceWorker" in navigator &&
  !isVitest &&
  !isMswDisabled;

if (typeof navigator !== "undefined" && navigator.serviceWorker) {
  // Drop malformed MSW worker messages that are missing a request payload
  // to avoid the deserializeRequest crash in the Storybook test runner.
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (!event?.data?.request?.url) {
      event.stopImmediatePropagation?.();
      return;
    }
  });
}

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
  decorators: [
    ...(isStorybookTestRunner || isAutomation
      ? [
          (Story) => (
            <MemoryRouter initialEntries={["/"]}>
              <Routes>
                <Route path="/" element={<Story />} />
                <Route path="/signup" element={<Story />} />
                <Route path="*" element={<Story />} />
              </Routes>
            </MemoryRouter>
          ),
        ]
      : []),
    withQueryClient,
    withLaunchDarkly,
  ],
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
