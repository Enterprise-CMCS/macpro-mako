import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { opensearch } from "shared-types";
import {
  renderDashboard,
  getDashboardQueryString,
  URL_CODE,
  getFilteredHits,
  DEFAULT_COLUMNS,
  HIDDEN_COLUMN,
  DEFAULT_FILTERS,
  verifyFiltering,
  verifyChips,
  verifyPagination,
  EMPTY_HITS,
} from "@/utils/test-helpers";
import { OsMainView, OsTableColumn } from "@/components";

const verifyTable = (recordCount: number) => {
  const table = screen.getByRole("table");
  expect(within(table).getAllByRole("columnheader").length).toEqual(3);
  expect(within(table).getByText("SPA ID", { selector: "th>div" })).toBeInTheDocument();
  expect(within(table).getByText("State", { selector: "th>div" })).toBeInTheDocument();
  expect(within(table).getByText("Authority", { selector: "th>div" })).toBeInTheDocument();
  expect(within(table).getAllByRole("row").length).toEqual(recordCount + 1); // add 1 for header
};

describe("OsMainView", () => {
  const setup = (
    columns: OsTableColumn[],
    hits: opensearch.Hits<opensearch.main.Document>,
    queryString: string,
  ) => {
    const user = userEvent.setup();
    const rendered = renderDashboard(
      <OsMainView columns={columns} />,
      {
        data: hits,
        isLoading: false,
        error: null,
      },
      queryString,
    );
    return {
      user,
      ...rendered,
    };
  };

  describe("SPAs", () => {
    it("should display without filters", async () => {
      const spaHits = getFilteredHits(["CHIP SPA", "Medicaid SPA"]);
      const recordCount = spaHits.hits.length;
      setup(
        DEFAULT_COLUMNS,
        spaHits,
        getDashboardQueryString({
          tab: "spas",
        }),
      );

      verifyFiltering();
      verifyChips([]);
      verifyTable(recordCount);
      verifyPagination(recordCount);
    });

    it("should display with filters", async () => {
      const spaHits = getFilteredHits(["CHIP SPA", "Medicaid SPA"]);
      const recordCount = spaHits.hits.length;
      setup(
        DEFAULT_COLUMNS,
        spaHits,
        getDashboardQueryString({
          filters: DEFAULT_FILTERS,
          tab: "spas",
        }),
      );

      verifyFiltering();
      verifyChips([
        "State: Maryland, MD",
        "Authority: CHIP SPA",
        "RAI Withdraw Enabled:",
        "Final Disposition: 1/1/2025 - 1/1/2025",
      ]);
      expect(screen.getByText("RAI Withdraw Enabled:").textContent).toEqual(
        "RAI Withdraw Enabled: Yes",
      );
      verifyTable(recordCount);
      verifyPagination(recordCount);
    });

    it("should handle opening the Columns button", async () => {
      const spaHits = getFilteredHits(["CHIP SPA", "Medicaid SPA"]);
      const { user } = setup(
        [...DEFAULT_COLUMNS, HIDDEN_COLUMN],
        spaHits,
        getDashboardQueryString({
          filters: DEFAULT_FILTERS,
          tab: "spas",
        }),
      );
      expect(screen.queryByRole("dialog")).toBeNull();
      await user.click(screen.queryByRole("button", { name: "Columns (1 hidden)" }));
      const columns = screen.queryByRole("dialog");
      expect(columns).toBeInTheDocument();
      expect(within(columns).getByText("SPA ID")).toBeInTheDocument();
      expect(within(columns).getByText("SPA ID").parentElement).toHaveClass("text-gray-800");
      expect(within(columns).getByText("State")).toBeInTheDocument();
      expect(within(columns).getByText("State").parentElement).toHaveClass("text-gray-800");
      expect(within(columns).getByText("Authority")).toBeInTheDocument();
      expect(within(columns).getByText("Authority").parentElement).toHaveClass("text-gray-800");
      expect(within(columns).getByText("Submission Source")).toBeInTheDocument();
      expect(within(columns).getByText("Submission Source").parentElement).toHaveClass(
        "text-gray-400",
      );
    });

    it("should handle hiding a column", async () => {
      const spaHits = getFilteredHits(["CHIP SPA", "Medicaid SPA"]);
      const { user } = setup(
        DEFAULT_COLUMNS,
        spaHits,
        getDashboardQueryString({
          tab: "spas",
        }),
      );

      const table = screen.getByRole("table");
      expect(within(table).getAllByRole("columnheader").length).toEqual(3);
      expect(within(table).getByText("SPA ID", { selector: "th>div" })).toBeInTheDocument();
      expect(within(table).getByText("State", { selector: "th>div" })).toBeInTheDocument();
      expect(within(table).getByText("Authority", { selector: "th>div" })).toBeInTheDocument();

      await user.click(screen.queryByRole("button", { name: "Columns" }));
      const columns = screen.queryByRole("dialog");
      await user.click(within(columns).getByText("State"));

      expect(within(table).getAllByRole("columnheader").length).toEqual(2);
      expect(within(table).getByText("SPA ID", { selector: "th>div" })).toBeInTheDocument();
      expect(within(table).getByText("Authority", { selector: "th>div" })).toBeInTheDocument();
    });

    it("should handle showing a column", async () => {
      const spaHits = getFilteredHits(["CHIP SPA", "Medicaid SPA"]);
      const { user } = setup(
        [...DEFAULT_COLUMNS, HIDDEN_COLUMN],
        spaHits,
        getDashboardQueryString({
          filters: DEFAULT_FILTERS,
          tab: "spas",
        }),
      );

      const table = screen.getByRole("table");
      expect(within(table).getAllByRole("columnheader").length).toEqual(3);
      expect(within(table).getByText("SPA ID", { selector: "th>div" })).toBeInTheDocument();
      expect(within(table).getByText("State", { selector: "th>div" })).toBeInTheDocument();
      expect(within(table).getByText("Authority", { selector: "th>div" })).toBeInTheDocument();

      await user.click(screen.queryByRole("button", { name: "Columns (1 hidden)" }));
      const columns = screen.queryByRole("dialog");
      await user.click(within(columns).getByText("Submission Source"));

      expect(within(table).getAllByRole("columnheader").length).toEqual(4);
      expect(within(table).getByText("SPA ID", { selector: "th>div" })).toBeInTheDocument();
      expect(within(table).getByText("State", { selector: "th>div" })).toBeInTheDocument();
      expect(within(table).getByText("Authority", { selector: "th>div" })).toBeInTheDocument();
      expect(
        within(table).getByText("Submission Source", { selector: "th>div" }),
      ).toBeInTheDocument();
    });

    it("should handle clicking a column header", async () => {
      // const paramsSpy = vi.spyOn(router, "useSearchParams").mockImplementation;
      const spaHits = getFilteredHits(["CHIP SPA", "Medicaid SPA"]);
      const { user, router } = setup(
        [...DEFAULT_COLUMNS, HIDDEN_COLUMN],
        spaHits,
        getDashboardQueryString({
          filters: DEFAULT_FILTERS,
          tab: "spas",
        }),
      );

      await user.click(screen.getByText("State", { selector: "th>div" }));
      const expectedQueryString = getDashboardQueryString({
        filters: DEFAULT_FILTERS,
        tab: "spas",
        sort: {
          field: "state.keyword",
          order: "asc",
        },
      }).replaceAll("+", "%2B");
      expect(router.state.location.search).toEqual(`?code=${URL_CODE}&os=${expectedQueryString}`);
    });

    it("should handle opening the Filters button", async () => {
      const spaHits = getFilteredHits(["CHIP SPA", "Medicaid SPA"]);
      const { user } = setup(
        [...DEFAULT_COLUMNS, HIDDEN_COLUMN],
        spaHits,
        getDashboardQueryString({
          filters: DEFAULT_FILTERS,
          tab: "spas",
        }),
      );
      expect(screen.queryByRole("dialog")).toBeNull();
      await user.click(screen.queryByRole("button", { name: "Filters" }));
      const filters = screen.queryByRole("dialog");
      expect(filters).toBeInTheDocument();
    });

    it("should enable the Export button if there are hits", async () => {
      const spaHits = getFilteredHits(["CHIP SPA", "Medicaid SPA"]);
      setup(
        [...DEFAULT_COLUMNS, HIDDEN_COLUMN],
        spaHits,
        getDashboardQueryString({
          filters: DEFAULT_FILTERS,
          tab: "spas",
        }),
      );
      expect(screen.queryByRole("button", { name: "Export" })).toBeEnabled();
    });

    it("should disable the Export button if there are no hits", async () => {
      setup(
        [...DEFAULT_COLUMNS, HIDDEN_COLUMN],
        EMPTY_HITS,
        getDashboardQueryString({
          filters: DEFAULT_FILTERS,
          tab: "spas",
        }),
      );
      expect(screen.queryByRole("button", { name: "Export" })).toBeDisabled();
    });

    it("should handle changing the page size", async () => {
      const spaHits = getFilteredHits(["CHIP SPA", "Medicaid SPA"]);
      const { user, router } = setup(
        [...DEFAULT_COLUMNS, HIDDEN_COLUMN],
        spaHits,
        getDashboardQueryString({
          filters: DEFAULT_FILTERS,
          tab: "spas",
        }),
      );

      const recordsSelect = within(screen.getByTestId("pagination")).getByLabelText(
        "Records per page:",
      );
      screen.debug(recordsSelect);
      await user.selectOptions(recordsSelect, ["50"]);
      expect(recordsSelect).toHaveValue("50");
      const expectedQueryString = getDashboardQueryString({
        filters: DEFAULT_FILTERS,
        tab: "spas",
        pagination: {
          number: 0,
          size: 50,
        },
      });
      const params = new URLSearchParams(router.state.location.search.substring(1));
      expect(params.get("os")).toEqual(expectedQueryString);
    });
  });

  describe("Waivers", () => {
    it("should display without filters", async () => {
      const waiverHits = getFilteredHits(["1915(b)", "1915(c)"]);
      const recordCount = waiverHits.hits.length;
      setup(
        DEFAULT_COLUMNS,
        waiverHits,
        getDashboardQueryString({
          tab: "waivers",
        }),
      );

      verifyFiltering();
      verifyChips([]);
      verifyTable(recordCount);
      verifyPagination(recordCount);
    });
  });
});
