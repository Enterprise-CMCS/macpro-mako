import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExportToCsv } from "export-to-csv";
import { getFilteredDocList } from "mocks";
import { opensearch } from "shared-types";
import { describe, expect, it, vi } from "vitest";

import { OsFiltering, OsTableColumn } from "@/components";
import {
  DEFAULT_COLUMNS,
  getDashboardQueryString,
  getFilteredHits,
  HIDDEN_COLUMN,
  renderDashboard,
} from "@/utils/test-helpers";

const defaultHits = getFilteredHits(["CHIP SPA", "Medicaid SPA"]);

const setup = (
  columns: OsTableColumn[],
  onToggle: (field: string) => void,
  disabled?: boolean,
  hits: opensearch.Hits<opensearch.main.Document> = defaultHits,
) => {
  const user = userEvent.setup();
  const rendered = renderDashboard(
    <OsFiltering columns={columns} onToggle={onToggle} disabled={disabled} />,
    {
      data: hits,
      error: null,
      isLoading: false,
    },
    getDashboardQueryString(),
  );
  return {
    user,
    ...rendered,
  };
};

describe("Visibility button", () => {
  it("should display the filtering buttons", async () => {
    const onToggle = vi.fn();
    setup(DEFAULT_COLUMNS, onToggle, false);

    const search = screen.queryByLabelText("Search by Package ID, CPOC Name, or Submitter Name");
    expect(search).toBeInTheDocument();
    expect(search).toBeEnabled();

    expect(screen.queryByRole("button", { name: "Columns" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Filters" })).toBeInTheDocument();

    const exportBtn = screen.queryByRole("button", { name: "Export" });
    expect(exportBtn).toBeInTheDocument();
    expect(exportBtn).toBeEnabled();
  });

  it("should display filtering button with hidden columns", async () => {
    const onToggle = vi.fn();
    setup([...DEFAULT_COLUMNS, HIDDEN_COLUMN], onToggle, false);

    const search = screen.queryByLabelText("Search by Package ID, CPOC Name, or Submitter Name");
    expect(search).toBeInTheDocument();
    expect(search).toBeEnabled();

    expect(screen.queryByRole("button", { name: "Columns (1 hidden)" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Filters" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Export" })).toBeInTheDocument();
  });

  it("should display the filtering buttons with disabled search", async () => {
    const onToggle = vi.fn();
    setup(DEFAULT_COLUMNS, onToggle, true);

    const search = screen.queryByLabelText("Search by Package ID, CPOC Name, or Submitter Name");
    expect(search).toBeInTheDocument();
    expect(search).toBeDisabled();

    expect(screen.queryByRole("button", { name: "Columns" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Filters" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Export" })).toBeInTheDocument();
  });

  it("should display the filtering buttons with Export disabled", async () => {
    const onToggle = vi.fn();
    setup(DEFAULT_COLUMNS, onToggle, false, {
      hits: [],
      max_score: 5,
      total: { value: 0, relation: "eq" },
    });

    expect(
      screen.queryByLabelText("Search by Package ID, CPOC Name, or Submitter Name"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Columns" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Filters" })).toBeInTheDocument();

    const exportBtn = screen.queryByRole("button", { name: "Export" });
    expect(exportBtn).toBeInTheDocument();
    expect(exportBtn).toBeDisabled();
  });

  it("should handle searching", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    setup(DEFAULT_COLUMNS, onToggle, false);

    const search = screen.queryByLabelText("Search by Package ID, CPOC Name, or Submitter Name");
    await user.type(search, "testing[Enter]");
    expect(search).toHaveValue("testing");
  });

  it("should handle clicking the Columns button", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    setup(DEFAULT_COLUMNS, onToggle, false);

    expect(screen.queryByRole("dialog")).toBeNull();
    await user.click(screen.queryByRole("button", { name: "Columns" }));
    const columns = screen.queryByRole("menu");
    expect(columns).toBeInTheDocument();
    expect(within(columns).getByText("State")).toBeInTheDocument();
    expect(within(columns).getByText("Authority")).toBeInTheDocument();
  });

  it("should handle clicking the Filters button", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    setup(DEFAULT_COLUMNS, onToggle, false);

    const filters = screen.getByRole("button", { name: "Filters" });
    expect(filters.getAttribute("data-state")).toEqual("closed");
    await user.click(filters);
    expect(screen.getByRole("heading", { name: "Filters", level: 4 })).toBeInTheDocument();
  });

  it("should handle clicking the Export button", async () => {
    const spy = vi.spyOn(ExportToCsv.prototype, "generateCsv").mockImplementation(() => {});
    const expected = getFilteredDocList(["CHIP SPA", "Medicaid SPA"]).map((doc) => ({
      Authority: doc.authority,
      "SPA ID": doc.id,
      State: doc.state,
    }));
    const user = userEvent.setup();
    const onToggle = vi.fn();
    setup(DEFAULT_COLUMNS, onToggle, false);

    await user.click(screen.getByRole("button", { name: "Export" }));
    expect(spy).toHaveBeenCalledWith(expected);
  });
});
