import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { OsExportData, OsTableColumn } from "@/components";
import * as ga from "@/utils/ReactGA/SendGAEvent";
import {
  DEFAULT_COLUMNS,
  getDashboardQueryString,
  HIDDEN_COLUMN,
  NO_TRANSFORM_COLUMN,
  renderFilterDrawer,
} from "@/utils/test-helpers";

import * as exportUtils from "./export.utils";

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

    const tooltipTrigger = screen.queryByTestId("export-csv-btn");
    expect(tooltipTrigger).toBeInTheDocument();

    const tooltipContent = screen.queryByText("No records available");
    expect(tooltipContent).not.toBeInTheDocument();
  });

  it("Tooltip content shown on hover", async () => {
    const { user } = setup(true);

    const tooltipTrigger = screen.queryByTestId("export-csv-btn");
    expect(tooltipTrigger).toBeTruthy();
    expect(tooltipTrigger).toBeDisabled();

    if (tooltipTrigger) user.hover(tooltipTrigger);

    await waitFor(() => screen.getByTestId("tooltip-content"));
    expect(screen.queryAllByText("No records available")[0]).toBeVisible();
  });

  it("should export on click if button is enabled", async () => {
    const csvSpy = vi.spyOn(exportUtils, "exportCsvRows").mockImplementation(() => {});
    const gaSpy = vi.spyOn(ga, "sendGAEvent").mockImplementation(() => {});

    const { user } = setup(false);

    await user.click(screen.queryByTestId("export-csv-btn"));

    expect(csvSpy).toHaveBeenCalledTimes(1);
    const [rowsArg, filenameArg] = csvSpy.mock.calls[0] ?? [[], ""];
    expect(rowsArg).toHaveLength(12);
    expect(rowsArg[0]).toEqual(
      expect.objectContaining({
        "SPA ID": expect.any(String),
        State: expect.any(String),
        Authority: expect.any(String),
      }),
    );
    expect(filenameArg).toMatch(/-export-\d{2}_\d{2}_\d{4}$/);
    expect(gaSpy).toHaveBeenCalledWith("dash_export_csv", { row_count: 12 });
  });

  it("should show modal when count is greater than 10000", async () => {
    const { user } = setup(false, 10001);

    await user.click(screen.queryByTestId("export-csv-btn"));

    expect(screen.getByText("Export limit reached")).toBeVisible();
    expect(
      screen.getByText(
        "Only the first 10,000 records can be exported. Try filtering to get fewer results.",
      ),
    ).toBeVisible();
  });

  it("should not show modal when count is under the limit", async () => {
    const { user } = setup(false, 9999);

    await user.click(screen.queryByTestId("export-csv-btn"));

    expect(screen.queryByText("Export limit reached")).not.toBeInTheDocument();
  });

  it("should proceed with exporting when export button is clicked in the modal", async () => {
    const csvSpy = vi.spyOn(exportUtils, "exportCsvRows").mockImplementation(() => {});

    const { user } = setup(false, 10001);

    await user.click(screen.queryByTestId("export-csv-btn"));

    expect(screen.getByText("Export limit reached")).toBeVisible();

    const exportButton = screen.getByRole("button", { name: "Export" });

    await user.click(exportButton);

    await waitFor(() => expect(csvSpy).toHaveBeenCalled());

    expect(screen.queryByText("Export limit reached")).not.toBeInTheDocument();
  });

  it("should not open modal if button is disabled", async () => {
    const { user } = setup(true, 10001);

    await user.click(screen.queryByTestId("export-csv-btn"));

    expect(screen.queryByText("Export limit reached")).not.toBeInTheDocument();
  });
});
