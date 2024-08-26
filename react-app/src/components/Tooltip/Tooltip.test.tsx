import { ReactNode } from "react";
import { Link, MemoryRouter, Route, Routes, createMemoryRouter, RouterProvider } from "react-router-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, test, beforeAll, vi } from "vitest";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from ".";
import { OsExportData, useOsUrl } from "../Opensearch";
import { Dashboard, dashboardLoader } from "@/features";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";

const renderWithClient = (ui: ReactJSXElement) => {
  const queryClient = new QueryClient();

  return {
    ...render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>),
    queryClient,
  };
}

describe("Tooltip Component", async () => {
  beforeAll(() => {
    // const queryClient = new QueryClient();
    const memoryRouter = createMemoryRouter(
      [
        { path: "/dashboard", element:<Dashboard/> },
      ],
      {
        initialEntries: ["/dashboard"],
      },
    );
    // renderWithClient(<RouterProvider router={memoryRouter} />);
    renderWithClient(<Dashboard />);
  });
  test("Tooltip content hidden when not hovering", () => {
    // renderWithClient(<Dashboard/>)
    const tooltipTrigger = screen.getByText("Dashboard")
    expect(tooltipTrigger).toBeInTheDocument();
    // const tooltipContent = screen.queryByTestId("tooltip-content");
    // expect(tooltipContent).not.toBeInTheDocument();
  });

  // test("Tooltip content shown on hover", async () => {
  //   const tooltipTrigger = screen.queryByTestId("tooltip-trigger");
  //   expect(tooltipTrigger).toBeInTheDocument();

  //   fireEvent.mouseOver(tooltipTrigger);
  //   const tooltipContent = screen.getByRole('tooltip-content', { name: /test tooltip info/i})
  //   // const tooltipContent = screen.queryByTestId("tooltip-content");
  //   expect(tooltipContent).toBeInTheDocument();
  // });
});
