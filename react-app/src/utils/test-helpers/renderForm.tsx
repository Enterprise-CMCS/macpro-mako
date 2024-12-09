import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, waitForElementToBeRemoved } from "@testing-library/react";
import React, { ReactElement } from "react";
import { MemoryRouter, createMemoryRouter, RouterProvider } from "react-router-dom";
import items from "mocks/data/items";
import { Authority } from "shared-types";

const createTestQueryClient = () =>
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

export const queryClientWrapper = ({ children }) => (
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

export const renderFormAsync = async (form: ReactElement) => {
  const container = await renderWithQueryClient(form);

  // wait for loading
  if (container.queryAllByLabelText("three-dots-loading")?.length > 0) {
    await waitForElementToBeRemoved(() => container.queryAllByLabelText("three-dots-loading"));
  }

  return container;
};

export const renderFormWithPackageSectionAsync = async (
  form: ReactElement,
  id: string,
  authority?: string,
) => {
  const routes = [
    {
      path: "/dashboard",
      element: <h1>dashboard test</h1>,
    },
    {
      path: "/test/:id/:authority",
      element: form,
    },
  ];
  const routeOptions = {
    initialEntries: [
      `/test/${id}/${(authority || items[id]?._source?.authority || "Medicaid SPA") as Authority}`,
    ],
  };

  const container = await renderWithQueryClientAndMemoryRouter(form, routes, routeOptions);

  // wait for loading
  if (container.queryAllByLabelText("three-dots-loading")?.length > 0) {
    await waitForElementToBeRemoved(() => container.queryAllByLabelText("three-dots-loading"));
  }

  return container;
};
