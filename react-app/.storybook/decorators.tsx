import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setMockUsername } from "mocks";

const queryClient = new QueryClient();

export const withQueryClient = (Story, { parameters }) => {
  if (parameters.username) {
    setMockUsername(parameters.username);
  }

  return <QueryClientProvider client={queryClient}>{Story()}</QueryClientProvider>;
};
