// .storybook/decorators.tsx
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

// --------- env detection for tests / a11y ---------

const isVitest = typeof import.meta !== "undefined" && (import.meta as any).vitest;

const isStorybookTestRunner =
  typeof window !== "undefined" && (window as any).__STORYBOOK_TEST_RUNNER__ === true;

const isLdDisabled =
  isVitest ||
  isStorybookTestRunner ||
  (typeof import.meta !== "undefined" &&
    (import.meta as any).env?.VITE_STORYBOOK_DISABLE_LD === "true");

// --------- LaunchDarkly provider (only in real Storybook) ---------

let LDProvider: React.ComponentType<{ children: React.ReactNode }> | null = null;

if (!isLdDisabled) {
  // Only initialize LD in real Storybook usage
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

export const withQueryClient = (Story: React.ComponentType) => (
  <QueryClientProvider client={queryClient}>
    <Story />
  </QueryClientProvider>
);

export const withLaunchDarkly = (Story: React.ComponentType) => {
  // In tests / a11y runs, LD is a no-op wrapper
  if (isLdDisabled || !LDProvider) {
    return <Story />;
  }

  return (
    <LDProvider>
      <Story />
    </LDProvider>
  );
};

// MSW flag helpers (unchanged)
export const updateFlags = (toggleFlags: Record<string, any>) => [
  ...launchDarklyHandlers,
  toggleGetLDEvalStreamHandler(toggleFlags),
  toggleGetLDEvalxHandler(toggleFlags),
];

// User-role decorators (unchanged)
export const asLoggedOut = (Story: React.ComponentType) => {
  setMockUsername(null);
  return <Story />;
};

export const asStateSubmitter = (Story: React.ComponentType) => {
  setMockUsername(TEST_STATE_SUBMITTER_USERNAME);
  return <Story />;
};

export const asStateSystemAdmin = (Story: React.ComponentType) => {
  setMockUsername(OS_STATE_SYSTEM_ADMIN_USERNAME);
  return <Story />;
};

export const asDefaultCmsUser = (Story: React.ComponentType) => {
  setMockUsername(DEFAULT_CMS_USER_EMAIL);
  return <Story />;
};

export const asCmsReviewer = (Story: React.ComponentType) => {
  setMockUsername(TEST_REVIEWER_USERNAME);
  return <Story />;
};

export const asCmsRoleApprover = (Story: React.ComponentType) => {
  setMockUsername(CMS_ROLE_APPROVER_USERNAME);
  return <Story />;
};

export const asHelpDesk = (Story: React.ComponentType) => {
  setMockUsername(HELP_DESK_USER_USERNAME);
  return <Story />;
};

export const asSystemAdmin = (Story: React.ComponentType) => {
  setMockUsername(SYSTEM_ADMIN_USERNAME);
  return <Story />;
};
