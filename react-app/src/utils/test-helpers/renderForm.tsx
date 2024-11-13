import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { ReactElement } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

export const renderForm = (form: ReactElement) =>
  render(form, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>{children}</MemoryRouter>,
      </QueryClientProvider>
    ),
  });

export const renderFormWithPackageSection = (form: ReactElement) =>
  render(form, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={["/test/12345/Medicaid SPA"]}>
          <Routes>
            <Route path="/test/:id/:authority" element={children} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    ),
  });
