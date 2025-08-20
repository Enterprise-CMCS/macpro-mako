import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setMockUsername } from "mocks";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export const withQueryClient = (Story, { parameters }) => {
  if (parameters.username === null || parameters.username) {
    setMockUsername(parameters.username);
  }

  return <QueryClientProvider client={queryClient}>{Story()}</QueryClientProvider>;
};
