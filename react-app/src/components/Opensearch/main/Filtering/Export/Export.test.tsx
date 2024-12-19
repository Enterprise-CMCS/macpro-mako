import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach } from "vitest";
import { OsExportData } from "@/components";
import userEvent from "@testing-library/user-event";

vi.mock("@/components/Opensearch/main/useOpensearch.ts", () => ({
  useOsUrl: vi.fn(),
}));

describe("Tooltip component within export button", () => {
  const user = userEvent.setup();

  beforeEach(async () => {
    render(<OsExportData columns={[]} disabled={true} />);
    // Wait for initial render to complete
    await waitFor(() => {
      expect(screen.getByTestId("tooltip-trigger")).toBeInTheDocument();
    });
  });

  test("Tooltip content hidden when not hovering", async () => {
    const tooltipTrigger = screen.getByTestId("tooltip-trigger");
    expect(tooltipTrigger).toBeInTheDocument();
    expect(screen.queryByTestId("tooltip-content")).not.toBeInTheDocument();
  });

  test("Tooltip content shown on hover", async () => {
    const tooltipTrigger = screen.getByTestId("tooltip-trigger");
    expect(tooltipTrigger).toBeInTheDocument();
    expect(tooltipTrigger).toBeDisabled();

    // Hover over the button
    await user.hover(tooltipTrigger);

    // Wait for tooltip to appear
    await waitFor(() => {
      expect(screen.getByTestId("tooltip-content")).toBeInTheDocument();
    });
    expect(screen.getByText("No records available")).toBeVisible();
  });
});
