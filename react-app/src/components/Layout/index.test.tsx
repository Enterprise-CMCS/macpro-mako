import { describe, it, expect, beforeAll, vi } from "vitest";
import { Layout } from "./index";
import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock components
vi.mock("../UsaBanner", () => ({
  UsaBanner: () => null,
}));

vi.mock("../Footer", () => ({
  Footer: () => null,
}));

vi.mock("@/components", () => ({
  SimplePageContainer: ({ children }: { children: React.ReactNode }) =>
    children,
  UserPrompt: () => null,
  Banner: () => null,
}));

// Mock the API module
vi.mock("@/api", () => ({
  useGetUser: () => ({
    isLoading: false,
    isError: false,
    data: {
      user: null,
    },
  }),
  getUser: vi.fn().mockResolvedValue({ user: null }),
}));

// Mock features
vi.mock("@/features/welcome", () => ({
  Welcome: () => null,
  loader: () => ({ error: null }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const routes = [
  {
    path: "/",
    element: <Layout />,
    errorElement: <div>Error</div>,
    children: [
      {
        index: true,
        element: <div>Welcome</div>,
      },
    ],
  },
];

const router = createMemoryRouter(routes, {
  initialEntries: ["/"],
  initialIndex: 0,
});

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
