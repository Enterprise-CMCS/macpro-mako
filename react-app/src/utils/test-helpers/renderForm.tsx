import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { ReactElement } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { TEST_ITEM_ID } from "mocks";

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

export const renderForm = (form: ReactElement) =>
  render(form, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter>{children}</MemoryRouter>,
      </QueryClientProvider>
    ),
  });

export const renderFormWithPackageSection = async (form: ReactElement) =>
  render(form, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter initialEntries={[`/test/${TEST_ITEM_ID}/Medicaid SPA`]}>
          <Routes>
            <Route path="/test/:id/:authority" element={children} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    ),
  });
