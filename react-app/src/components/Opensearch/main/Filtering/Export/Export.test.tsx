import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach } from "vitest";
import { OsExportData } from "@/components";
import userEvent from "@testing-library/user-event";

vi.mock("@/components/Opensearch/main/useOpensearch.ts", () => ({
  useOsUrl: vi.fn(),
}));

describe("Tooltip component within export button", () => {
  beforeEach(() => {
    render(<OsExportData columns={[]} disabled={true} />);
  });

  test("Tooltip content hidden when not hovering", async () => {
    const tooltipTrigger = screen.queryByTestId("tooltip-trigger");
    expect(tooltipTrigger).toBeInTheDocument();

    const tooltipContent = screen.queryByText("No records available");
    expect(tooltipContent).not.toBeInTheDocument();
  });

  test("Tooltip content shown on hover", async () => {
    const tooltipTrigger = screen.queryByTestId("tooltip-trigger");
    expect(tooltipTrigger).toBeDisabled();

    userEvent.hover(screen.queryByTestId("tooltip-trigger"));

    await waitFor(() => screen.getByTestId("tooltip-content"));
    expect(screen.queryAllByText("No records available")[0]).toBeVisible();
  });
});
