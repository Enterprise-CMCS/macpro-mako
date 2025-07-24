import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setMockUsername } from "mocks";
import { createMemoryRouter, MemoryRouter, RouterProvider } from "react-router";

const queryClient = new QueryClient();

export const withQueryClient = (Story) => (
  <QueryClientProvider client={queryClient}>{Story()}</QueryClientProvider>
);

export const withMemoryRouter = (Story) => <MemoryRouter>{Story()}</MemoryRouter>;

export const withQueryClientAndMemoryRouter = (Story, { parameters }) => {
  if (parameters.username) {
    setMockUsername(parameters.username);
  }

  const router = createMemoryRouter(parameters.routes, parameters.routeOptions);
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};
