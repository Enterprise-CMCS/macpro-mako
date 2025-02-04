import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { ReactElement } from "react";
import { createMemoryRouter, MemoryRouter, RouterProvider } from "react-router";
import { render } from "@testing-library/react";

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {},
    },
  });

export const queryClientWrapper = ({ children }: { children: ReactElement }) => (
  <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
);

export const renderWithQueryClient = (element: ReactElement) =>
  render(element, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter>{children}</MemoryRouter>,
      </QueryClientProvider>
    ),
  });

export const renderWithMemoryRouter = (
  element: ReactElement,
  ...routing: Parameters<typeof createMemoryRouter>
) =>
  render(element, {
    wrapper: () => <RouterProvider router={createMemoryRouter(...routing)} />,
  });

export const renderWithQueryClientAndMemoryRouter = (
  element: ReactElement,
  ...routing: Parameters<typeof createMemoryRouter>
) =>
  render(element, {
    wrapper: () => (
      <QueryClientProvider client={createTestQueryClient()}>
        <RouterProvider router={createMemoryRouter(...routing)} />
      </QueryClientProvider>
    ),
  });
