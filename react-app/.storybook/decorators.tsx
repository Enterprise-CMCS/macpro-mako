import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setMockUsername, TEST_REVIEWER_USERNAME, TEST_STATE_SUBMITTER_USERNAME } from "mocks";

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

export const asUser = (Story, { parameters }) => {
  if (parameters.username === null || parameters.username) {
    setMockUsername(parameters.username);
  }
  return Story();
};

export const asLoggedOut = (Story) => {
  setMockUsername(null);
  return Story();
};

export const asStateSubmitter = (Story) => {
  setMockUsername(TEST_STATE_SUBMITTER_USERNAME);
  return Story();
};

export const asCmsReviewer = (Story) => {
  setMockUsername(TEST_REVIEWER_USERNAME);
  return Story();
};
