import "@fontsource/open-sans";
import "./index.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { asyncWithLDProvider } from "launchdarkly-react-client-sdk";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import ReactGA from 'react-ga4';

import config from "@/config";
import { queryClient } from "@/utils";

import { router } from "./router";

const ldClientId = config.launchDarkly?.CLIENT_ID;
const googleAnalyticsGtag = config.googleAnalytics?.GOOGLE_ANALYTICS_ID;

if (ldClientId === undefined) {
  throw new Error("To configure LaunchDarkly, you must set LAUNCHDARKLY_CLIENT_ID");
}
// This is a global wrapper for fetch that modifies headers
// const originalFetch = window.fetch;

// window.fetch = async function(url, options) {
//   // Check if this is a request to Google Analytics
//   if (url.toString().includes("google-analytics.com")) {
//     // Modify headers for Google Analytics requests
//     options = {
//       ...options,
//       headers: {
//         ...options.headers,
//         'Referrer-Policy': 'no-referrer-when-downgrade', // Example: change referrer policy
//         'Origin': 'https://yourdomain.com', // Add custom Origin header if needed
//         // Any other custom headers you want to add
//       },
//     };
//   }

//   // Call the original fetch function
//   return originalFetch(url, options);
// };

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

  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <LDProvider>
          <RouterProvider router={router} />
        </LDProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </React.StrictMode>
  );
};

initializeApp();
