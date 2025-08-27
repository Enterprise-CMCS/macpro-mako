import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  CMS_ROLE_APPROVER_USERNAME,
  DEFAULT_CMS_USER_EMAIL,
  HELP_DESK_USER_USERNAME,
  OS_STATE_SYSTEM_ADMIN_USERNAME,
  setMockUsername,
  SYSTEM_ADMIN_USERNAME,
  TEST_REVIEWER_USERNAME,
  TEST_STATE_SUBMITTER_USERNAME,
} from "mocks";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export const withQueryClient = (Story) => (
  <QueryClientProvider client={queryClient}>{Story()}</QueryClientProvider>
);

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
