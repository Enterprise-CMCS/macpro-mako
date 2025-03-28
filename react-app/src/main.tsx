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
        <LDProvider>
          <FlagRouter />
        </LDProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </React.StrictMode>,
  );
};

const FlagRouter = () => {
  const loginFlag = useFeatureFlag("LOGIN_PAGE");

  return <RouterProvider router={router(loginFlag)} />;
};

initializeLaunchDarkly();
