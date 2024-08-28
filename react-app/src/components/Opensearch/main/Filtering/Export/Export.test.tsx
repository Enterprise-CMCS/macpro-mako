import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach } from "vitest";
import { OsExportData } from "@/components";

vi.mock("@/components/Opensearch/main/useOpensearch.ts", () => ({
  useOsUrl: vi.fn()
}))

describe("Tooltip Component", () => {
  beforeEach(() => {
    render(
      <OsExportData columns={[]}/>
    );
  })
  test("Tooltip content hidden when not hovering", async () => {
    // confirm dashboard and export button is rendered
    // hover export button
    // mock no records showing
    // hover export button, should be disabled and tooltip content should show in doc

    const tooltipTrigger = screen.getByText("Export");
    expect(tooltipTrigger).toBeInTheDocument();
    const tooltipContent = screen.queryByRole("tooltip-content");
    expect(tooltipContent).not.toBeInTheDocument();
  });

  // Disable export button first
  // test("Tooltip content shown on hover", async () => {
  //   const tooltipTrigger = screen.queryByRole("tooltip-trigger");
  //   expect(tooltipTrigger).toBeInTheDocument();

  //   fireEvent.mouseOver(screen.getByText("Export"));
  //   // const tooltipContent = screen.queryByRole('tooltip-content')
  //   await waitFor(() => screen.queryByRole('tooltip-content'))
  //   // const tooltipContent = screen.queryByTestId("tooltip-content");
  //   expect(screen.queryByRole('tooltip-content')).toBeInTheDocument();
  // });
});
