import { describe, it, expect, beforeAll, vi } from "vitest";
import { Layout } from "./index";
import { render } from "@testing-library/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the useGetUser hook
vi.mock("@/api", () => ({
  useGetUser: () => ({
    isLoading: false,
    isError: false,
    data: {
      user: null,
    },
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    loader: () => ({ error: null }),
  },
]);

const renderWithProviders = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
};

beforeAll(() => {
  // Mock window.matchMedia
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

describe("Layout", () => {
  it("renders without errors", () => {
    const { getByTestId } = renderWithProviders();
    const layout = getByTestId("nav-banner-d");
    expect(layout).toBeInTheDocument();
  });
});
