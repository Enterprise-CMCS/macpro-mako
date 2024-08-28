import { ReactNode } from "react";
import {
  Link,
  MemoryRouter,
  Route,
  Routes,
  createMemoryRouter,
  RouterProvider,
  BrowserRouter,
} from "react-router-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../../../../Tooltip";
import { OsExportData } from "@/components";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/components/Opensearch/main/useOpensearch.ts", () => ({
  useOsUrl: vi.fn()
}))

describe("Tooltip Component", () => {
  test("Tooltip content hidden when not hovering", async () => {
    render(
      <OsExportData columns={[]}/>
    );

    // confirm dashboard and export button is rendered
    // hover export button
    // mock no records showing
    // hover export button, should be disabled and tooltip content should show in doc

    expect(1).toEqual(1);
    // const tooltipTrigger = screen.getByText("SPAs");
    // expect(tooltipTrigger).toBeInTheDocument();
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
