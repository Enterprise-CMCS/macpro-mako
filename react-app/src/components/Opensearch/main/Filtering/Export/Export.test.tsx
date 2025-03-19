import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExportToCsv } from "export-to-csv";
import { getFilteredDocList } from "mocks";
import { describe, expect, it, vi } from "vitest";

import { OsExportData, OsTableColumn } from "@/components";
import {
  DEFAULT_COLUMNS,
  getDashboardQueryString,
  HIDDEN_COLUMN,
  NO_TRANSFORM_COLUMN,
  renderFilterDrawer,
} from "@/utils/test-helpers";

const columns: OsTableColumn[] = [...DEFAULT_COLUMNS, NO_TRANSFORM_COLUMN, HIDDEN_COLUMN];

const setup = (disabled?: boolean, count: number = 123) => {
  const user = userEvent.setup();
  const rendered = renderFilterDrawer(
    <OsExportData columns={columns} disabled={disabled} count={count} />,
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

  it("should show modal when count is greater than 10000", async () => {
    const { user } = setup(false, 10001);

    await user.click(screen.queryByTestId("tooltip-trigger"));

    expect(screen.getByText("Export limit reached")).toBeVisible();
    expect(
      screen.getByText(
        "Only the first 10,000 records can be exported. Try filtering to get fewer results.",
      ),
    ).toBeVisible();
  });
});
