import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { asyncWithLDProvider } from "launchdarkly-react-client-sdk";
import {
  CMS_ROLE_APPROVER_USERNAME,
  DEFAULT_CMS_USER_EMAIL,
  HELP_DESK_USER_USERNAME,
  LAUNCHDARKLY_CLIENT_ID,
  launchDarklyHandlers,
  OS_STATE_SYSTEM_ADMIN_USERNAME,
  setMockUsername,
  SYSTEM_ADMIN_USERNAME,
  TEST_REVIEWER_USERNAME,
  TEST_STATE_SUBMITTER_USERNAME,
  toggleGetLDEvalStreamHandler,
  toggleGetLDEvalxHandler,
} from "mocks";
import React from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Detect Storybook test runner (used by test-storybook / Playwright)
const isStorybookTestRunner =
  typeof window !== "undefined" && (window as any).__STORYBOOK_TEST_RUNNER__;

// In normal Storybook we use a real LD provider.
// In a11y / test-runner, we use a no-op provider to avoid open connections.
let LDProvider: React.ComponentType<{ children: React.ReactNode }>;

if (isStorybookTestRunner) {
  // No-op provider for test runner / accessibility pipeline
  LDProvider = ({ children }) => <>{children}</>;
} else {
  // Real LaunchDarkly provider for interactive Storybook
  LDProvider = await asyncWithLDProvider({
    clientSideID: LAUNCHDARKLY_CLIENT_ID,
    options: {
      bootstrap: "localStorage",
      baseUrl: "https://clientsdk.launchdarkly.us",
      streamUrl: "https://clientstream.launchdarkly.us",
      eventsUrl: "https://events.launchdarkly.us",
    },
  });
}

export const withQueryClient = (Story) => (
  <QueryClientProvider client={queryClient}>{Story()}</QueryClientProvider>
);

export const withLaunchDarkly = (Story) => <LDProvider>{Story()}</LDProvider>;

export const updateFlags = (toggleFlags) => [
  ...launchDarklyHandlers,
  toggleGetLDEvalStreamHandler(toggleFlags),
  toggleGetLDEvalxHandler(toggleFlags),
];

export const asLoggedOut = (Story) => {
  setMockUsername(null);
  return Story();
};

export const asStateSubmitter = (Story) => {
  setMockUsername(TEST_STATE_SUBMITTER_USERNAME);
  return Story();
};

export const asStateSystemAdmin = (Story) => {
  setMockUsername(OS_STATE_SYSTEM_ADMIN_USERNAME);
  return Story();
};

export const asDefaultCmsUser = (Story) => {
  setMockUsername(DEFAULT_CMS_USER_EMAIL);
  return Story();
};

export const asCmsReviewer = (Story) => {
  setMockUsername(TEST_REVIEWER_USERNAME);
  return Story();
};

export const asCmsRoleApprover = (Story) => {
  setMockUsername(CMS_ROLE_APPROVER_USERNAME);
  return Story();
};

export const asHelpDesk = (Story) => {
  setMockUsername(HELP_DESK_USER_USERNAME);
  return Story();
};

export const asSystemAdmin = (Story) => {
  setMockUsername(SYSTEM_ADMIN_USERNAME);
  return Story();
};
