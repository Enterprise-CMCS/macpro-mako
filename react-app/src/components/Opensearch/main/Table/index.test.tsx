import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OsTable, OsTableColumn } from "@/components";
import { opensearch } from "shared-types";
import {
  renderDashboard,
  getDashboardQueryString,
  getFilteredHits,
  DEFAULT_COLUMNS,
  EMPTY_HITS,
} from "@/utils/test-helpers";

const defaultHits = getFilteredHits(["CHIP SPA", "Medicaid SPA"]);

const setup = (
  columns: OsTableColumn[],
  onToggle: (field: string) => void,
  hits: opensearch.Hits<opensearch.main.Document>,
) => {
  const user = userEvent.setup();
  const rendered = renderDashboard(
    <OsTable columns={columns} onToggle={onToggle} />,
    {
      data: hits,
      isLoading: false,
      error: null,
    },
    getDashboardQueryString(),
  );
  return {
    user,
    ...rendered,
  };
};

describe("", () => {
  it("should display the table with values", () => {
    const onToggle = vi.fn();
    setup(DEFAULT_COLUMNS, onToggle, defaultHits);

    // Check that the correct column headers appear
    expect(screen.getAllByRole("columnheader").length).toEqual(3);
    expect(screen.getByText("SPA ID", { selector: "th>div" }));
    expect(screen.getByText("State", { selector: "th>div" }));
    expect(screen.getByText("Authority", { selector: "th>div" }));

    // Check that the correct amount rows appear
    expect(screen.getAllByRole("row").length).toEqual(defaultHits.hits.length + 1); // add 1 for header
  });

  it("should display the table with no values", () => {
    const onToggle = vi.fn();
    setup(DEFAULT_COLUMNS, onToggle, EMPTY_HITS);

    // Check that the correct column headers appear
    expect(screen.getAllByRole("columnheader").length).toEqual(3);
    expect(screen.getByText("SPA ID", { selector: "th>div" }));
    expect(screen.getByText("State", { selector: "th>div" }));
    expect(screen.getByText("Authority", { selector: "th>div" }));

    expect(screen.getByText("No Results Found")).toBeInTheDocument();
    expect(
      screen.getByText("Adjust your search and filter to find what you are looking for."),
    ).toBeInTheDocument();

    // Check that the correct amount rows appear
    expect(screen.getAllByRole("row").length).toEqual(2);
    // one row for the header and one for the no results text
  });
});
