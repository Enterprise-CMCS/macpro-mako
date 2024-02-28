import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "@fontsource/open-sans";
import "./index.css"; // this one second
import { queryClient, router } from "./router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { UserContextProvider } from "@/components";
import config from "@/config";
import { asyncWithLDProvider } from "launchdarkly-react-client-sdk";

const ldClientId = config.launchDarkly?.CLIENT_ID;
if (ldClientId === undefined) {
  throw new Error(
    "To configure LaunchDarkly, you must set LAUNCHDARKLY_CLIENT_ID"
  );
}

const initializeLaunchDarkly = async () => {
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
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <UserContextProvider>
          <LDProvider>
            <RouterProvider router={router} />
          </LDProvider>
        </UserContextProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </React.StrictMode>
  );
};

initializeLaunchDarkly();
