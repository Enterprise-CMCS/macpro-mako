import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { screen, within, waitForElementToBeRemoved, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  opensearch,
  SEATOOL_STATUS,
  statusToDisplayToCmsUser,
  statusToDisplayToStateUser,
} from "shared-types";
import {
  renderDashboard,
  getDashboardQueryString,
  verifyFiltering,
  verifyChips,
  verifyPagination,
  skipCleanup,
} from "@/utils/test-helpers";
import {
  TEST_STATE_SUBMITTER_USER,
  TEST_CMS_REVIEWER_USER,
  TEST_HELP_DESK_USER,
  TEST_READ_ONLY_USER,
  setMockUsername,
  TEST_MED_SPA_ITEM,
  TEST_CHIP_SPA_ITEM,
} from "mocks";
import { SpasList } from "./index";

const BASE_ITEM = {
  state: "MD",
  origin: "OneMAC",
  submissionDate: "2024-01-01T00:00:00.000Z",
  makoChangedDate: "2024-02-01T00:00:00.000Z",
  changedDate: "2024-03-01T00:00:00.000Z",
};

const PENDING_SUBMITTED_ITEM = {
  _id: "MD-01-2024",
  _source: {
    ...TEST_MED_SPA_ITEM._source,
    ...BASE_ITEM,
    id: "MD-01-2024",
    seatoolStatus: SEATOOL_STATUS.PENDING,
    cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.PENDING],
    stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.PENDING],
    actionType: "New",
    submitterName: "Alice Anderson",
  },
};

const PENDING_RAI_REQUEST_ITEM = {
  _id: "MD-02-2024",
  _source: {
    ...TEST_CHIP_SPA_ITEM._source,
    ...BASE_ITEM,
    id: "MD-02-2024",
    seatoolStatus: SEATOOL_STATUS.PENDING_RAI,
    cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.PENDING_RAI],
    stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.PENDING_RAI],
    raiRequestedDate: "2024-03-01T00:00:00.000Z",
    submitterName: "Beth Bernard",
  },
};

const PENDING_RAI_RECEIVED_ITEM = {
  _id: "MD-03-2024",
  _source: {
    ...TEST_MED_SPA_ITEM._source,
    ...BASE_ITEM,
    id: "MD-03-2024",
    seatoolStatus: SEATOOL_STATUS.PENDING,
    cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.PENDING],
    stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.PENDING],
    actionType: "New",
    raiRequestedDate: "2024-03-01T00:00:00.000Z",
    raiReceivedDate: "2024-03-01T00:00:00.000Z",
    submitterName: "Carl Carson",
  },
};

const items = [PENDING_SUBMITTED_ITEM, PENDING_RAI_REQUEST_ITEM, PENDING_RAI_RECEIVED_ITEM];
const hitCount = items.length;
const defaultHits: opensearch.Hits<opensearch.main.Document> = {
  hits: items as opensearch.Hit<opensearch.main.Document>[],
  max_score: 5,
  total: { value: hitCount, relation: "eq" },
};

const verifyColumns = (hasActions: boolean) => {
  const table = screen.getByRole("table");

  if (hasActions) {
    expect(within(table).getByText("Actions", { selector: "th>div" })).toBeInTheDocument();
  }
  expect(within(table).getByText("SPA ID", { selector: "th>div" })).toBeInTheDocument();
  expect(within(table).getByText("State", { selector: "th>div" })).toBeInTheDocument();
  expect(within(table).getByText("Authority", { selector: "th>div" })).toBeInTheDocument();
  expect(within(table).getByText("Status", { selector: "th>div" })).toBeInTheDocument();
  expect(within(table).getByText("Initial Submission", { selector: "th>div" })).toBeInTheDocument();
  expect(
    within(table).getByText("Latest Package Activity", { selector: "th>div" }),
  ).toBeInTheDocument();
  expect(
    within(table).getByText("Formal RAI Response", { selector: "th>div" }),
  ).toBeInTheDocument();
  expect(within(table).getByText("Submitted By", { selector: "th>div" })).toBeInTheDocument();
  expect(table.firstElementChild.firstElementChild.childElementCount).toEqual(hasActions ? 9 : 8);

  // Check that the correct amount rows appear
  expect(screen.getAllByRole("row").length).toEqual(hitCount + 1); // add 1 for header
};

const verifyRow = (
  doc: opensearch.main.Document,
  hasActions: boolean,
  status: string,
  raiResponse: string,
) => {
  const row = within(screen.getByRole("table")).getByText(doc.id).parentElement.parentElement;
  const cells = row.children;
  let cellIndex = hasActions ? 1 : 0;

  if (hasActions) {
    // Actions
    expect(within(row).getByRole("button", { name: "Available actions" }));
  }
  expect(cells[cellIndex].textContent).toEqual(doc.id); // SPA ID
  expect(cells[cellIndex].firstElementChild.getAttribute("href")).toEqual(
    `/details/${encodeURI(doc.authority)}/${doc.id}`,
  );
  cellIndex++;
  expect(cells[cellIndex].textContent).toEqual(doc.state); // State
  cellIndex++;
  expect(cells[cellIndex].textContent).toEqual(doc.authority); // Authority
  cellIndex++;
  expect(cells[cellIndex].textContent).toEqual(status); // Status
  cellIndex++;
  expect(cells[cellIndex].textContent).toEqual("01/01/2024"); // Initial Submitted
  cellIndex++;
  expect(cells[cellIndex].textContent).toEqual("02/01/2024"); // Latest Package Activity
  cellIndex++;
  expect(cells[cellIndex].textContent).toEqual(raiResponse); // Formal RAI Response
  cellIndex++;
  expect(cells[cellIndex].textContent).toEqual(doc.submitterName); // Submitted By
};

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

  it("should return no columns if the user is not logged in", async () => {
    setMockUsername(null);

    await setup(
      defaultHits,
      getDashboardQueryString({
        tab: "spas",
      }),
    );

    const table = screen.getByRole("table");
    expect(table.firstElementChild.firstElementChild.childElementCount).toEqual(0);
  });

  describe("as a State Submitter", () => {
    beforeAll(async () => {
      skipCleanup();

      setMockUsername(TEST_STATE_SUBMITTER_USER.username);

      await setup(
        defaultHits,
        getDashboardQueryString({
          tab: "spas",
        }),
      );
    });

    afterAll(() => {
      cleanup();
    });

    it("should display the dashboard as expected", () => {
      verifyFiltering(4); // 4 hidden columns
      verifyChips([]); // no filters
      verifyColumns(true);
      verifyPagination(hitCount);
    });

    it("should display correct values for a new item that is Pending and does not have an RAI", async () => {
      const pendingDoc = PENDING_SUBMITTED_ITEM._source;

      verifyRow(pendingDoc, true, pendingDoc.stateStatus, "-- --");
    });

    it("should display correct values for an item that is Pending an RAI", async () => {
      const raiRequestDoc = PENDING_RAI_REQUEST_ITEM._source;

      verifyRow(raiRequestDoc, true, raiRequestDoc.stateStatus, "-- --");
    });

    it("should display correct values for an item that has Received an RAI", async () => {
      const raiReceivedDoc = PENDING_RAI_RECEIVED_ITEM._source;

      verifyRow(raiReceivedDoc, true, raiReceivedDoc.stateStatus, "03/01/2024");
    });
  });

  describe("as a CMS Reviewer", () => {
    beforeAll(async () => {
      skipCleanup();

      setMockUsername(TEST_CMS_REVIEWER_USER.username);

      await setup(
        defaultHits,
        getDashboardQueryString({
          tab: "spas",
        }),
      );
    });

    afterAll(() => {
      cleanup();
    });

    it("should display the filers, chips, and pagination as expected", () => {
      verifyFiltering(4); // 4 hidden columns
      verifyChips([]); // no filters
      verifyColumns(true);
      verifyPagination(hitCount);
    });

    it("should display correct values for a new item that is Pending and does not have an RAI", async () => {
      const pendingDoc = PENDING_SUBMITTED_ITEM._source;

      verifyRow(pendingDoc, true, pendingDoc.cmsStatus, "-- --");
    });

    it("should display correct values for an item that is Pending an RAI", async () => {
      const raiRequestDoc = PENDING_RAI_REQUEST_ITEM._source;

      verifyRow(raiRequestDoc, true, raiRequestDoc.cmsStatus, "-- --");
    });

    it("should display correct values for an item that has Received an RAI", async () => {
      const raiReceivedDoc = PENDING_RAI_RECEIVED_ITEM._source;

      verifyRow(raiReceivedDoc, true, raiReceivedDoc.cmsStatus, "03/01/2024");
    });
  });

  describe("as a CMS Helpdesk User", () => {
    beforeAll(async () => {
      skipCleanup();

      setMockUsername(TEST_HELP_DESK_USER.username);

      await setup(
        defaultHits,
        getDashboardQueryString({
          tab: "spas",
        }),
      );
    });

    afterAll(() => {
      cleanup();
    });

    it("should display the filers, chips, and pagination as expected", () => {
      verifyFiltering(4); // 4 hidden columns
      verifyChips([]); // no filters
      verifyColumns(false);
      verifyPagination(hitCount);
    });

    it("should display correct values for a new item that is Pending and does not have an RAI", async () => {
      const pendingDoc = PENDING_SUBMITTED_ITEM._source;

      verifyRow(pendingDoc, false, pendingDoc.stateStatus, "-- --");
    });

    it("should display correct values for an item that is Pending an RAI", async () => {
      const raiRequestDoc = PENDING_RAI_REQUEST_ITEM._source;

      verifyRow(raiRequestDoc, false, raiRequestDoc.stateStatus, "-- --");
    });

    it("should display correct values for an item that has Received an RAI", async () => {
      const raiReceivedDoc = PENDING_RAI_RECEIVED_ITEM._source;

      verifyRow(raiReceivedDoc, false, raiReceivedDoc.stateStatus, "03/01/2024");
    });
  });

  describe("as a CMS Read-only User", () => {
    beforeAll(async () => {
      skipCleanup();

      setMockUsername(TEST_READ_ONLY_USER.username);

      await setup(
        defaultHits,
        getDashboardQueryString({
          tab: "spas",
        }),
      );
    });

    afterAll(() => {
      cleanup();
    });

    it("should display the filers, chips, and pagination as expected", () => {
      verifyFiltering(4); // 4 hidden columns
      verifyChips([]); // no filters
      verifyColumns(false);
      verifyPagination(hitCount);
    });

    it("should display correct values for a new item that is Pending and does not have an RAI", async () => {
      const pendingDoc = PENDING_SUBMITTED_ITEM._source;

      verifyRow(pendingDoc, false, pendingDoc.cmsStatus, "-- --");
    });

    it("should display correct values for an item that is Pending an RAI", async () => {
      const raiRequestDoc = PENDING_RAI_REQUEST_ITEM._source;

      verifyRow(raiRequestDoc, false, raiRequestDoc.cmsStatus, "-- --");
    });

    it("should display correct values for an item that has Received an RAI", async () => {
      const raiReceivedDoc = PENDING_RAI_RECEIVED_ITEM._source;

      verifyRow(raiReceivedDoc, false, raiReceivedDoc.cmsStatus, "03/01/2024");
    });
  });
});
