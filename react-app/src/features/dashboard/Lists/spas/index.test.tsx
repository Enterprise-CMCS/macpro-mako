import { describe, expect, it, beforeEach } from "vitest";
import { screen, within, waitForElementToBeRemoved } from "@testing-library/react";
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
} from "@/utils/test-helpers";
import {
  TEST_STATE_SUBMITTER_USER,
  TEST_CMS_REVIEWER_USER,
  TEST_HELP_DESK_USER,
  TEST_READ_ONLY_USER,
  setMockUsername,
} from "mocks";
import { SpasList } from "./index";

const defaultHits = getFilteredHits(["CHIP SPA", "Medicaid SPA"]);
const hitCount = defaultHits.total.value;

describe("SpasList", () => {
  const setup = async (hits: opensearch.Hits<opensearch.main.Document>, queryString: string) => {
    const user = userEvent.setup();
    const rendered = renderDashboard(
      <SpasList />,
      {
        data: hits,
        isLoading: false,
        error: null,
      },
      queryString,
    );
    if (screen.queryAllByLabelText("three-dots-loading")?.length > 0) {
      await waitForElementToBeRemoved(() => screen.queryAllByLabelText("three-dots-loading"));
    }
    return {
      user,
      ...rendered,
    };
  };

  describe("as a State Submitter", () => {
    beforeEach(() => {
      setMockUsername(TEST_STATE_SUBMITTER_USER.username);
    });

    it("should display the spa dashboard tab with no filters and data", async () => {
      await setup(
        defaultHits,
        getDashboardQueryString({
          tab: "spas",
        }),
      );
      screen.debug();
      verifyFiltering(4);
      verifyChips([]);
      verifyPagination(hitCount);

      const table = screen.getByRole("table");
      screen.debug(table.children[0]);

      expect(within(table).getByText("Actions", { selector: "th>div" })).toBeInTheDocument();
      expect(within(table).getByText("SPA ID", { selector: "th>div" })).toBeInTheDocument();
      expect(within(table).getByText("State", { selector: "th>div" })).toBeInTheDocument();
      expect(within(table).getByText("Authority", { selector: "th>div" })).toBeInTheDocument();
      expect(within(table).getByText("Status", { selector: "th>div" })).toBeInTheDocument();
      expect(
        within(table).getByText("Initial Submission", { selector: "th>div" }),
      ).toBeInTheDocument();
      expect(
        within(table).getByText("Last Package Activity", { selector: "th>div" }),
      ).toBeInTheDocument();
      expect(
        within(table).getByText("Formal RAI Response", { selector: "th>div" }),
      ).toBeInTheDocument();
      expect(within(table).getByText("Submitted By", { selector: "th>div" })).toBeInTheDocument();
    });
  });
});
