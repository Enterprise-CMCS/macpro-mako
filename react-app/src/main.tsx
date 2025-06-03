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

// import "../globals";

const ldClientId = config.launchDarkly?.CLIENT_ID;
const googleAnalyticsGtag = config.googleAnalytics?.GOOGLE_ANALYTICS_ID;

if (ldClientId === undefined) {
  throw new Error("To configure LaunchDarkly, you must set LAUNCHDARKLY_CLIENT_ID");
}

if (googleAnalyticsGtag) {
  // ✅ Define dataLayer and gtag before loading the script
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag;

  // ✅ Inject GA script after defining gtag
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsGtag}`;
  document.head.appendChild(script);

  script.onload = () => {
    // ✅ Configure GA only after script loads
    window.gtag("js", new Date());
    window.gtag("config", googleAnalyticsGtag, {
      send_page_view: false,
      debug_mode: true
    });

    console.log("✔️ gtag.js loaded and configured:", googleAnalyticsGtag);
  };

  script.onerror = () => {
    console.error("❌ Failed to load gtag.js");
  };

  console.log("📊 Google Analytics setup started");
} else {
  console.warn("Google Analytics Measurement ID is not set.");
}
 else {
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
