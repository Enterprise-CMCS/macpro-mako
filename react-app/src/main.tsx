import "@fontsource/open-sans";
import "./index.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { asyncWithLDProvider } from "launchdarkly-react-client-sdk";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";

import config from "@/config";
import { queryClient } from "@/utils";

import { useFeatureFlag } from "./hooks/useFeatureFlag";
import { router } from "./router";

const ldClientId = config.launchDarkly?.CLIENT_ID;

if (ldClientId === undefined) {
  throw new Error("To configure LaunchDarkly, you must set LAUNCHDARKLY_CLIENT_ID");
}

const initializeApp = async () => {
  // Start the MSW server if in the DEV environment and the mocked flag is on
  if (import.meta.env.DEV && import.meta.env.MODE === "mocked") {
    const { mockedWorker } = await import("mocks/browser");
    const { setMockUsername, TEST_STATE_SUBMITTER_USERNAME } = await import("mocks");

    await mockedWorker.start({
      serviceWorker: { url: "/mockServiceWorker.js" },
      onUnhandledRequest: "warn",
    });

    await setMockUsername(import.meta.env.VITE_MOCK_USER_USERNAME || TEST_STATE_SUBMITTER_USERNAME);
  }

  // Initialize LaunchDarkly
  const LDProvider = await asyncWithLDProvider({
    clientSideID: ldClientId,
    options: {
      bootstrap: "localStorage",
      baseUrl: "https://clientsdk.launchdarkly.us",
      streamUrl: "https://clientstream.launchdarkly.us",
      eventsUrl: "https://events.launchdarkly.us",
    },
  });

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <LDProvider>
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <FlagRouter />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </React.StrictMode>
    </LDProvider>,
  );
};

const FlagRouter = () => {
  const loginFlag = useFeatureFlag("LOGIN_PAGE");

  return <RouterProvider router={router(loginFlag)} />;
};

initializeApp();
