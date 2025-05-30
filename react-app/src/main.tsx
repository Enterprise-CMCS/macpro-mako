import "@fontsource/open-sans";
import "./index.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { asyncWithLDProvider } from "launchdarkly-react-client-sdk";
import React from "react";
import ReactDOM from "react-dom/client";
import ReactGA from "react-ga4";
import { RouterProvider } from "react-router";

import config from "@/config";
import { queryClient } from "@/utils";

import { useFeatureFlag } from "./hooks/useFeatureFlag";
import { router } from "./router";

const ldClientId = config.launchDarkly?.CLIENT_ID;
const googleAnalyticsGtag = config.googleAnalytics?.GOOGLE_ANALYTICS_ID;
if (ldClientId === undefined) {
  throw new Error("To configure LaunchDarkly, you must set LAUNCHDARKLY_CLIENT_ID");
}

const initializeApp = async () => {
  // Initialize Google Analytics
  if (googleAnalyticsGtag) {
    ReactGA.initialize(googleAnalyticsGtag);
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  } else {
    console.warn("Google Analytics Measurement ID is not set.");
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

  if (import.meta.env.DEV) {
    await import("../mockServiceWorker.js?worker");
  }

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
