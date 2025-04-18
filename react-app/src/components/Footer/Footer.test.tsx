import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { FAQFooter, Footer } from "./index";

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

describe("Footer", () => {
  it("renders footer", () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <Footer
          email="testEmail@email.com"
          address={{
            city: "testCity",
            state: "testState",
            street: "testStreet",
            zip: 1234,
          }}
        />
      </QueryClientProvider>,
    );

    expect(screen.queryByText("testEmail@email.com")).toBeInTheDocument();
    expect(screen.queryByText("testCity, testState 1234")).toBeInTheDocument();
  });
});

describe("FAQFooter", () => {
  it("renders faqfooter", () => {
    render(
      <BrowserRouter>
        <FAQFooter />
      </BrowserRouter>,
    );

    expect(screen.queryByText("View FAQs")).toBeInTheDocument();
    expect(screen.queryByText("Do you have questions or need support?")).toBeInTheDocument();
  });
});
