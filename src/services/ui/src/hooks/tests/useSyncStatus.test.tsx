import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { useSyncStatus } from "../useSyncStatus";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const TestComponent = () => {
  const syncStatus = useSyncStatus({
    expectedStatus: "Approved",
    path: "/",
  });

  return (
    <button
      onClick={() => {
        syncStatus("testing");
        queryClient.setQueryData(["record", "testing"], () => ({
          _source: {
            seatoolStatus: "Approved",
          },
        }));
      }}
    >
      Submit Record
    </button>
  );
};

const renderWithRouterAndQuery = () => {
  const Wrapper = () => {
    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: <h1>This is the Home Page</h1>,
        },
        {
          path: "/test-route",
          element: <TestComponent />,
        },
      ],
      {
        initialEntries: ["/test-route"],
      },
    );

    return (
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );
  };

  render(<Wrapper />);
};

describe("useSyncStatus Hook Tests", () => {
  it("redirects to correct route on success", async () => {
    renderWithRouterAndQuery();

    await userEvent.click(screen.getByText("Submit Record"));

    expect(screen.getByText("This is the Home Page")).toBeInTheDocument();
  });
});
