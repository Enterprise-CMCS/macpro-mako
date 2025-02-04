import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OsExportData, OsTableColumn } from "@/components";
import { ExportToCsv } from "export-to-csv";
import { getFilteredDocList } from "mocks";
import {
  renderFilterDrawer,
  DEFAULT_COLUMNS,
  HIDDEN_COLUMN,
  NO_TRANSFORM_COLUMN,
  getDashboardQueryString,
} from "@/utils/test-helpers";

const columns: OsTableColumn[] = [...DEFAULT_COLUMNS, NO_TRANSFORM_COLUMN, HIDDEN_COLUMN];

const setup = (disabled?: boolean) => {
  const user = userEvent.setup();
  const rendered = renderFilterDrawer(
    <OsExportData columns={columns} disabled={disabled} />,
    getDashboardQueryString(),
  );
  return {
    user,
    ...rendered,
  };
};

describe("Tooltip component within export button", () => {
  it("Tooltip content hidden when not hovering", async () => {
    setup(true);

    const tooltipTrigger = screen.queryByTestId("tooltip-trigger");
    expect(tooltipTrigger).toBeInTheDocument();

    const tooltipContent = screen.queryByText("No records available");
    expect(tooltipContent).not.toBeInTheDocument();
  });

  it("Tooltip content shown on hover", async () => {
    const { user } = setup(true);

    const tooltipTrigger = screen.queryByTestId("tooltip-trigger");
    expect(tooltipTrigger).toBeTruthy();
    expect(tooltipTrigger).toBeDisabled();

    if (tooltipTrigger) user.hover(tooltipTrigger);

    await waitFor(() => screen.getByTestId("tooltip-content"));
    expect(screen.queryAllByText("No records available")[0]).toBeVisible();
  });

  it("should export on click if button is enabled", async () => {
    const spy = vi.spyOn(ExportToCsv.prototype, "generateCsv").mockImplementation(() => {});
    const expected = getFilteredDocList(["CHIP SPA", "Medicaid SPA"]).map((doc) => ({
      Authority: doc.authority,
      "SPA ID": doc.id,
      State: doc.state,
    }));

    const { user } = setup(false);

    await user.click(screen.queryByTestId("tooltip-trigger"));

    expect(spy).toHaveBeenCalledWith(expected);
  });
});
