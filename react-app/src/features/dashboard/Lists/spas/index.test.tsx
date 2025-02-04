import { describe, expect, it, vi, beforeAll, afterAll, afterEach } from "vitest";
import { screen, within, waitForElementToBeRemoved, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExportToCsv } from "export-to-csv";
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
import { BLANK_VALUE } from "@/consts";
import * as api from "@/api";
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
    leadAnalystName: "Beth Bernard",
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
    submitterName: "Carl Carson",
    leadAnalystName: "Dan Davis",
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
    raiReceivedDate: "2024-04-01T00:00:00.000Z",
    submitterName: "Ethan Evans",
    leadAnalystName: "Fran Foster",
  },
};

const RAI_WITHDRAW_ENABLED_ITEM = {
  _id: "MD-04-2024",
  _source: {
    ...TEST_CHIP_SPA_ITEM._source,
    ...BASE_ITEM,
    id: "MD-04-2024",
    seatoolStatus: SEATOOL_STATUS.PENDING,
    cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.PENDING],
    stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.PENDING],
    actionType: "New",
    raiRequestedDate: "2024-03-01T00:00:00.000Z",
    raiReceivedDate: "2024-04-01T00:00:00.000Z",
    submitterName: "Graham Greggs",
    leadAnalystName: "Henry Harrison",
    raiWithdrawEnabled: true,
  },
};

const RAI_WITHDRAW_DISABLED_ITEM = {
  _id: "MD-05-2024",
  _source: {
    ...TEST_MED_SPA_ITEM._source,
    ...BASE_ITEM,
    id: "MD-05-2024",
    seatoolStatus: SEATOOL_STATUS.PENDING,
    cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.PENDING],
    stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.PENDING],
    actionType: "New",
    raiRequestedDate: "2024-03-01T00:00:00.000Z",
    raiReceivedDate: "2024-04-01T00:00:00.000Z",
    submitterName: "Isaac Irwin",
    leadAnalystName: "Jack Jefferson",
    raiWithdrawEnabled: false,
  },
};

const APPROVED_ITEM = {
  _id: "MD-06-2024",
  _source: {
    ...TEST_CHIP_SPA_ITEM._source,
    ...BASE_ITEM,
    id: "MD-06-2024",
    seatoolStatus: SEATOOL_STATUS.PENDING,
    cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.PENDING],
    stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.PENDING],
    finalDispositionDate: "05/01/2024",
    actionType: "New",
    submitterName: "Kevin Kline",
    leadAnalystName: "Liz Lemon",
  },
};

const BLANK_ITEM = {
  _id: "MD-07-2024",
  _source: {
    id: "MD-07-2024",
    seatoolStatus: SEATOOL_STATUS.PENDING,
    cmsStatus: statusToDisplayToCmsUser[SEATOOL_STATUS.PENDING],
    stateStatus: statusToDisplayToStateUser[SEATOOL_STATUS.PENDING],
    origin: "OneMAC",
  },
};

const items = [
  PENDING_SUBMITTED_ITEM,
  PENDING_RAI_REQUEST_ITEM,
  PENDING_RAI_RECEIVED_ITEM,
  RAI_WITHDRAW_ENABLED_ITEM,
  RAI_WITHDRAW_DISABLED_ITEM,
  APPROVED_ITEM,
  BLANK_ITEM,
] as opensearch.Hit<opensearch.main.Document>[];
const hitCount = items.length;
const defaultHits: opensearch.Hits<opensearch.main.Document> = {
  hits: items,
  max_score: 5,
  total: { value: hitCount, relation: "eq" },
};

const getExpectedExportData = (useCmsStatus: boolean) => {
  const pendingDoc = PENDING_SUBMITTED_ITEM._source;
  const raiRequestDoc = PENDING_RAI_REQUEST_ITEM._source;
  const raiReceivedDoc = PENDING_RAI_RECEIVED_ITEM._source;
  const withdrawEnabledDoc = RAI_WITHDRAW_ENABLED_ITEM._source;
  const withdrawDisabledDoc = RAI_WITHDRAW_DISABLED_ITEM._source;
  const approvedDoc = APPROVED_ITEM._source;
  const blankDoc = BLANK_ITEM._source;
  return [
    {
      Authority: pendingDoc.authority,
      "Formal RAI Response": "-- --",
      "Initial Submission": "01/01/2024",
      "Latest Package Activity": "02/01/2024",
      "SPA ID": pendingDoc.id,
      State: pendingDoc.state,
      Status: useCmsStatus ? pendingDoc.cmsStatus : pendingDoc.stateStatus,
      "Submitted By": pendingDoc.submitterName,
      "CPOC Name": pendingDoc.leadAnalystName,
      "Final Disposition": "-- --",
      "Formal RAI Requested": "-- --",
      "Submission Source": "OneMAC",
    },
    {
      Authority: raiRequestDoc.authority,
      "Formal RAI Response": "-- --",
      "Initial Submission": "01/01/2024",
      "Latest Package Activity": "02/01/2024",
      "SPA ID": raiRequestDoc.id,
      State: raiRequestDoc.state,
      Status: useCmsStatus ? raiRequestDoc.cmsStatus : raiRequestDoc.stateStatus,
      "Submitted By": raiRequestDoc.submitterName,
      "CPOC Name": raiRequestDoc.leadAnalystName,
      "Final Disposition": "-- --",
      "Formal RAI Requested": "03/01/2024",
      "Submission Source": "OneMAC",
    },
    {
      Authority: raiReceivedDoc.authority,
      "Formal RAI Response": "04/01/2024",
      "Initial Submission": "01/01/2024",
      "Latest Package Activity": "02/01/2024",
      "SPA ID": raiReceivedDoc.id,
      State: raiReceivedDoc.state,
      Status: useCmsStatus ? raiReceivedDoc.cmsStatus : raiReceivedDoc.stateStatus,
      "Submitted By": raiReceivedDoc.submitterName,
      "CPOC Name": raiReceivedDoc.leadAnalystName,
      "Final Disposition": "-- --",
      "Formal RAI Requested": "03/01/2024",
      "Submission Source": "OneMAC",
    },
    {
      Authority: withdrawEnabledDoc.authority,
      "Formal RAI Response": "04/01/2024",
      "Initial Submission": "01/01/2024",
      "Latest Package Activity": "02/01/2024",
      "SPA ID": withdrawEnabledDoc.id,
      State: withdrawEnabledDoc.state,
      Status: `${useCmsStatus ? withdrawEnabledDoc.cmsStatus : withdrawEnabledDoc.stateStatus} (Withdraw Formal RAI Response - Enabled)`,
      "Submitted By": withdrawEnabledDoc.submitterName,
      "CPOC Name": withdrawEnabledDoc.leadAnalystName,
      "Final Disposition": "-- --",
      "Formal RAI Requested": "03/01/2024",
      "Submission Source": "OneMAC",
    },
    {
      Authority: withdrawDisabledDoc.authority,
      "Formal RAI Response": "04/01/2024",
      "Initial Submission": "01/01/2024",
      "Latest Package Activity": "02/01/2024",
      "SPA ID": withdrawDisabledDoc.id,
      State: withdrawDisabledDoc.state,
      Status: useCmsStatus ? withdrawDisabledDoc.cmsStatus : withdrawDisabledDoc.stateStatus,
      "Submitted By": withdrawDisabledDoc.submitterName,
      "CPOC Name": withdrawDisabledDoc.leadAnalystName,
      "Final Disposition": "-- --",
      "Formal RAI Requested": "03/01/2024",
      "Submission Source": "OneMAC",
    },
    {
      Authority: approvedDoc.authority,
      "Formal RAI Response": "-- --",
      "Initial Submission": "01/01/2024",
      "Latest Package Activity": "02/01/2024",
      "SPA ID": approvedDoc.id,
      State: approvedDoc.state,
      Status: useCmsStatus ? approvedDoc.cmsStatus : approvedDoc.stateStatus,
      "Submitted By": approvedDoc.submitterName,
      "CPOC Name": approvedDoc.leadAnalystName,
      "Final Disposition": "05/01/2024",
      "Formal RAI Requested": "-- --",
      "Submission Source": "OneMAC",
    },
    {
      Authority: "-- --",
      "Formal RAI Response": "-- --",
      "Initial Submission": "-- --",
      "Latest Package Activity": "-- --",
      "SPA ID": blankDoc.id,
      State: "-- --",
      Status: useCmsStatus ? blankDoc.cmsStatus : blankDoc.stateStatus,
      "Submitted By": "-- --",
      "CPOC Name": "-- --",
      "Final Disposition": "-- --",
      "Formal RAI Requested": "-- --",
      "Submission Source": "OneMAC",
    },
  ];
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
  {
    hasActions,
    status,
    submissionDate = BLANK_VALUE,
    makoChangedDate = BLANK_VALUE,
    finalDispositionDate = BLANK_VALUE,
    raiRequestedDate = BLANK_VALUE,
    raiReceivedDate = BLANK_VALUE,
  }: {
    hasActions: boolean;
    status: string;
    submissionDate?: string;
    makoChangedDate?: string;
    raiRequestedDate?: string;
    finalDispositionDate?: string;
    raiReceivedDate?: string;
  },
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
  expect(cells[cellIndex].textContent).toEqual(doc.state || BLANK_VALUE); // State
  cellIndex++;
  expect(cells[cellIndex].textContent).toEqual(doc.authority || BLANK_VALUE); // Authority
  cellIndex++;
  expect(cells[cellIndex].textContent).toEqual(status); // Status
  cellIndex++;
  expect(cells[cellIndex].textContent).toEqual(submissionDate); // Initial Submitted
  cellIndex++;
  expect(cells[cellIndex].textContent).toEqual(finalDispositionDate); // Final Disposition
  cellIndex++;
  expect(cells[cellIndex].textContent).toEqual(doc.origin); // Submission Source
  cellIndex++;
  expect(cells[cellIndex].textContent).toEqual(makoChangedDate); // Latest Package Activity
  cellIndex++;
  expect(cells[cellIndex].textContent).toEqual(raiRequestedDate); // Formal RAI Requested
  cellIndex++;
  expect(cells[cellIndex].textContent).toEqual(raiReceivedDate); // Formal RAI Response
  cellIndex++;
  expect(cells[cellIndex].textContent).toEqual(doc.leadAnalystName || BLANK_VALUE); // CPOC Name
  cellIndex++;
  expect(cells[cellIndex].textContent).toEqual(doc.submitterName || BLANK_VALUE); // Submitted By
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

  // most of the tests are using MSW to get a set of generic items,
  // however these tests are using items created in this file that cover
  // specific cases, so we want to get those from the `getMainExportData`
  // call instead of whatever MSW is returning
  vi.spyOn(api, "getMainExportData").mockResolvedValue(items.map((item) => ({ ...item._source })));

  afterEach(() => {
    vi.clearAllMocks();
  });

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
    let user;
    beforeAll(async () => {
      skipCleanup();

      setMockUsername(TEST_STATE_SUBMITTER_USER.username);

      ({ user } = await setup(
        defaultHits,
        getDashboardQueryString({
          tab: "spas",
        }),
      ));
    });

    afterAll(() => {
      cleanup();
    });

    it("should display the dashboard as expected", async () => {
      verifyFiltering(4); // 4 hidden columns
      verifyChips([]); // no filters
      verifyColumns(true);
      verifyPagination(hitCount);
    });

    it("should handle showing all of the columns", async () => {
      // show all the hidden columns
      await user.click(screen.queryByRole("button", { name: "Columns (4 hidden)" }));
      const columns = screen.queryByRole("dialog");
      await user.click(within(columns).getByText("Final Disposition"));
      await user.click(within(columns).getByText("Submission Source"));
      await user.click(within(columns).getByText("Formal RAI Requested"));
      await user.click(within(columns).getByText("CPOC Name"));

      const table = screen.getByRole("table");
      expect(
        within(table).getByText("Final Disposition", { selector: "th>div" }),
      ).toBeInTheDocument();
      expect(
        within(table).getByText("Submission Source", { selector: "th>div" }),
      ).toBeInTheDocument();
      expect(
        within(table).getByText("Formal RAI Requested", { selector: "th>div" }),
      ).toBeInTheDocument();
      expect(within(table).getByText("CPOC Name", { selector: "th>div" })).toBeInTheDocument();
    });

    it.each([
      [
        "a new item that is pending without RAI",
        PENDING_SUBMITTED_ITEM._source,
        {
          hasActions: true,
          status: PENDING_SUBMITTED_ITEM._source.stateStatus,
          submissionDate: "01/01/2024",
          makoChangedDate: "02/01/2024",
        },
      ],
      [
        "an item that has requested an RAI",
        PENDING_RAI_REQUEST_ITEM._source,
        {
          hasActions: true,
          status: PENDING_RAI_REQUEST_ITEM._source.stateStatus,
          submissionDate: "01/01/2024",
          makoChangedDate: "02/01/2024",
          raiRequestedDate: "03/01/2024",
        },
      ],
      [
        "an item that has received an RAI",
        PENDING_RAI_RECEIVED_ITEM._source,
        {
          hasActions: true,
          status: PENDING_RAI_RECEIVED_ITEM._source.stateStatus,
          submissionDate: "01/01/2024",
          makoChangedDate: "02/01/2024",
          raiRequestedDate: "03/01/2024",
          raiReceivedDate: "04/01/2024",
        },
      ],
      [
        "an item that has RAI Withdraw enabled",
        RAI_WITHDRAW_ENABLED_ITEM._source,
        {
          hasActions: true,
          status: `${RAI_WITHDRAW_ENABLED_ITEM._source.stateStatus}· Withdraw Formal RAI Response - Enabled`,
          submissionDate: "01/01/2024",
          makoChangedDate: "02/01/2024",
          raiRequestedDate: "03/01/2024",
          raiReceivedDate: "04/01/2024",
        },
      ],
      [
        "an item with RAI Withdraw disabled",
        RAI_WITHDRAW_DISABLED_ITEM._source,
        {
          hasActions: true,
          status: RAI_WITHDRAW_DISABLED_ITEM._source.stateStatus,
          submissionDate: "01/01/2024",
          makoChangedDate: "02/01/2024",
          raiRequestedDate: "03/01/2024",
          raiReceivedDate: "04/01/2024",
        },
      ],
      [
        "an item that is approved",
        APPROVED_ITEM._source,
        {
          hasActions: true,
          status: APPROVED_ITEM._source.stateStatus,
          submissionDate: "01/01/2024",
          makoChangedDate: "02/01/2024",
          finalDispositionDate: "05/01/2024",
        },
      ],
      [
        "a blank item",
        BLANK_ITEM._source as opensearch.main.Document,
        {
          hasActions: true,
          status: BLANK_ITEM._source.stateStatus,
        },
      ],
    ])("should display the correct values for a row with %s", (title, doc, expected) => {
      verifyRow(doc, expected);
    });

    it("should handle export", async () => {
      const spy = vi.spyOn(ExportToCsv.prototype, "generateCsv").mockImplementation(() => {});

      await user.click(screen.queryByTestId("tooltip-trigger"));

      const expectedData = getExpectedExportData(false);
      expect(spy).toHaveBeenCalledWith(expectedData);
    });
  });

  describe("as a CMS Reviewer", () => {
    let user;
    beforeAll(async () => {
      skipCleanup();

      setMockUsername(TEST_CMS_REVIEWER_USER.username);

      ({ user } = await setup(
        defaultHits,
        getDashboardQueryString({
          tab: "spas",
        }),
      ));
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

    it("should handle showing all of the columns", async () => {
      // show all the hidden columns
      await user.click(screen.queryByRole("button", { name: "Columns (4 hidden)" }));
      const columns = screen.queryByRole("dialog");
      await user.click(within(columns).getByText("Final Disposition"));
      await user.click(within(columns).getByText("Submission Source"));
      await user.click(within(columns).getByText("Formal RAI Requested"));
      await user.click(within(columns).getByText("CPOC Name"));

      const table = screen.getByRole("table");
      expect(
        within(table).getByText("Final Disposition", { selector: "th>div" }),
      ).toBeInTheDocument();
      expect(
        within(table).getByText("Submission Source", { selector: "th>div" }),
      ).toBeInTheDocument();
      expect(
        within(table).getByText("Formal RAI Requested", { selector: "th>div" }),
      ).toBeInTheDocument();
      expect(within(table).getByText("CPOC Name", { selector: "th>div" })).toBeInTheDocument();
    });

    it.each([
      [
        "a new item that is pending without RAI",
        PENDING_SUBMITTED_ITEM._source,
        {
          hasActions: true,
          status: PENDING_SUBMITTED_ITEM._source.cmsStatus,
          submissionDate: "01/01/2024",
          makoChangedDate: "02/01/2024",
        },
      ],
      [
        "an item that has requested an RAI",
        PENDING_RAI_REQUEST_ITEM._source,
        {
          hasActions: true,
          status: PENDING_RAI_REQUEST_ITEM._source.cmsStatus,
          submissionDate: "01/01/2024",
          makoChangedDate: "02/01/2024",
          raiRequestedDate: "03/01/2024",
        },
      ],
      [
        "an item that has received an RAI",
        PENDING_RAI_RECEIVED_ITEM._source,
        {
          hasActions: true,
          status: PENDING_RAI_RECEIVED_ITEM._source.cmsStatus,
          submissionDate: "01/01/2024",
          makoChangedDate: "02/01/2024",
          raiRequestedDate: "03/01/2024",
          raiReceivedDate: "04/01/2024",
        },
      ],
      [
        "an item that has RAI Withdraw enabled",
        RAI_WITHDRAW_ENABLED_ITEM._source,
        {
          hasActions: true,
          status: `${RAI_WITHDRAW_ENABLED_ITEM._source.cmsStatus}· Withdraw Formal RAI Response - Enabled`,
          submissionDate: "01/01/2024",
          makoChangedDate: "02/01/2024",
          raiRequestedDate: "03/01/2024",
          raiReceivedDate: "04/01/2024",
        },
      ],
      [
        "an item with RAI Withdraw disabled",
        RAI_WITHDRAW_DISABLED_ITEM._source,
        {
          hasActions: true,
          status: RAI_WITHDRAW_DISABLED_ITEM._source.cmsStatus,
          submissionDate: "01/01/2024",
          makoChangedDate: "02/01/2024",
          raiRequestedDate: "03/01/2024",
          raiReceivedDate: "04/01/2024",
        },
      ],
      [
        "an item that is approved",
        APPROVED_ITEM._source,
        {
          hasActions: true,
          status: APPROVED_ITEM._source.cmsStatus,
          submissionDate: "01/01/2024",
          makoChangedDate: "02/01/2024",
          finalDispositionDate: "05/01/2024",
        },
      ],
      [
        "a blank item",
        BLANK_ITEM._source as opensearch.main.Document,
        {
          hasActions: true,
          status: BLANK_ITEM._source.cmsStatus,
        },
      ],
    ])("should display the correct values for a row with %s", (title, doc, expected) => {
      verifyRow(doc, expected);
    });

    it("should handle export", async () => {
      const spy = vi.spyOn(ExportToCsv.prototype, "generateCsv").mockImplementation(() => {});

      await userEvent.click(screen.queryByTestId("tooltip-trigger"));

      const expectedData = getExpectedExportData(true);
      expect(spy).toHaveBeenCalledWith(expectedData);
    });
  });

  describe("as a CMS Helpdesk User", () => {
    let user;
    beforeAll(async () => {
      skipCleanup();

      setMockUsername(TEST_HELP_DESK_USER.username);

      ({ user } = await setup(
        defaultHits,
        getDashboardQueryString({
          tab: "spas",
        }),
      ));
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

    it("should handle showing all of the columns", async () => {
      // show all the hidden columns
      await user.click(screen.queryByRole("button", { name: "Columns (4 hidden)" }));
      const columns = screen.queryByRole("dialog");
      await user.click(within(columns).getByText("Final Disposition"));
      await user.click(within(columns).getByText("Submission Source"));
      await user.click(within(columns).getByText("Formal RAI Requested"));
      await user.click(within(columns).getByText("CPOC Name"));

      const table = screen.getByRole("table");
      expect(
        within(table).getByText("Final Disposition", { selector: "th>div" }),
      ).toBeInTheDocument();
      expect(
        within(table).getByText("Submission Source", { selector: "th>div" }),
      ).toBeInTheDocument();
      expect(
        within(table).getByText("Formal RAI Requested", { selector: "th>div" }),
      ).toBeInTheDocument();
      expect(within(table).getByText("CPOC Name", { selector: "th>div" })).toBeInTheDocument();
    });

    it.each([
      [
        "a new item that is pending without RAI",
        PENDING_SUBMITTED_ITEM._source,
        {
          hasActions: false,
          status: PENDING_SUBMITTED_ITEM._source.stateStatus,
          submissionDate: "01/01/2024",
          makoChangedDate: "02/01/2024",
        },
      ],
      [
        "an item that has requested an RAI",
        PENDING_RAI_REQUEST_ITEM._source,
        {
          hasActions: false,
          status: PENDING_RAI_REQUEST_ITEM._source.stateStatus,
          submissionDate: "01/01/2024",
          makoChangedDate: "02/01/2024",
          raiRequestedDate: "03/01/2024",
        },
      ],
      [
        "an item that has received an RAI",
        PENDING_RAI_RECEIVED_ITEM._source,
        {
          hasActions: false,
          status: PENDING_RAI_RECEIVED_ITEM._source.stateStatus,
          submissionDate: "01/01/2024",
          makoChangedDate: "02/01/2024",
          raiRequestedDate: "03/01/2024",
          raiReceivedDate: "04/01/2024",
        },
      ],
      [
        "an item that has RAI Withdraw enabled",
        RAI_WITHDRAW_ENABLED_ITEM._source,
        {
          hasActions: false,
          status: `${RAI_WITHDRAW_ENABLED_ITEM._source.stateStatus}· Withdraw Formal RAI Response - Enabled`,
          submissionDate: "01/01/2024",
          makoChangedDate: "02/01/2024",
          raiRequestedDate: "03/01/2024",
          raiReceivedDate: "04/01/2024",
        },
      ],
      [
        "an item with RAI Withdraw disabled",
        RAI_WITHDRAW_DISABLED_ITEM._source,
        {
          hasActions: false,
          status: RAI_WITHDRAW_DISABLED_ITEM._source.stateStatus,
          submissionDate: "01/01/2024",
          makoChangedDate: "02/01/2024",
          raiRequestedDate: "03/01/2024",
          raiReceivedDate: "04/01/2024",
        },
      ],
      [
        "an item that is approved",
        APPROVED_ITEM._source,
        {
          hasActions: false,
          status: APPROVED_ITEM._source.stateStatus,
          submissionDate: "01/01/2024",
          makoChangedDate: "02/01/2024",
          finalDispositionDate: "05/01/2024",
        },
      ],
      [
        "a blank item",
        BLANK_ITEM._source as opensearch.main.Document,
        {
          hasActions: false,
          status: BLANK_ITEM._source.stateStatus,
        },
      ],
    ])("should display the correct values for a row with %s", (title, doc, expected) => {
      verifyRow(doc, expected);
    });

    it("should handle export", async () => {
      const spy = vi.spyOn(ExportToCsv.prototype, "generateCsv").mockImplementation(() => {});

      await userEvent.click(screen.queryByTestId("tooltip-trigger"));

      const expectedData = getExpectedExportData(false);
      expect(spy).toHaveBeenCalledWith(expectedData);
    });
  });

  describe("as a CMS Read-only User", () => {
    let user;
    beforeAll(async () => {
      skipCleanup();

      setMockUsername(TEST_READ_ONLY_USER.username);

      ({ user } = await setup(
        defaultHits,
        getDashboardQueryString({
          tab: "spas",
        }),
      ));
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

    it("should handle showing all of the columns", async () => {
      // show all the hidden columns
      await user.click(screen.queryByRole("button", { name: "Columns (4 hidden)" }));
      const columns = screen.queryByRole("dialog");
      await user.click(within(columns).getByText("Final Disposition"));
      await user.click(within(columns).getByText("Submission Source"));
      await user.click(within(columns).getByText("Formal RAI Requested"));
      await user.click(within(columns).getByText("CPOC Name"));

      const table = screen.getByRole("table");
      expect(
        within(table).getByText("Final Disposition", { selector: "th>div" }),
      ).toBeInTheDocument();
      expect(
        within(table).getByText("Submission Source", { selector: "th>div" }),
      ).toBeInTheDocument();
      expect(
        within(table).getByText("Formal RAI Requested", { selector: "th>div" }),
      ).toBeInTheDocument();
      expect(within(table).getByText("CPOC Name", { selector: "th>div" })).toBeInTheDocument();
    });

    it.each([
      [
        "a new item that is pending without RAI",
        PENDING_SUBMITTED_ITEM._source,
        {
          hasActions: false,
          status: PENDING_SUBMITTED_ITEM._source.cmsStatus,
          submissionDate: "01/01/2024",
          makoChangedDate: "02/01/2024",
        },
      ],
      [
        "an item that has requested an RAI",
        PENDING_RAI_REQUEST_ITEM._source,
        {
          hasActions: false,
          status: PENDING_RAI_REQUEST_ITEM._source.cmsStatus,
          submissionDate: "01/01/2024",
          makoChangedDate: "02/01/2024",
          raiRequestedDate: "03/01/2024",
        },
      ],
      [
        "an item that has received an RAI",
        PENDING_RAI_RECEIVED_ITEM._source,
        {
          hasActions: false,
          status: PENDING_RAI_RECEIVED_ITEM._source.cmsStatus,
          submissionDate: "01/01/2024",
          makoChangedDate: "02/01/2024",
          raiRequestedDate: "03/01/2024",
          raiReceivedDate: "04/01/2024",
        },
      ],
      [
        "an item that has RAI Withdraw enabled",
        RAI_WITHDRAW_ENABLED_ITEM._source,
        {
          hasActions: false,
          status: `${RAI_WITHDRAW_ENABLED_ITEM._source.cmsStatus}· Withdraw Formal RAI Response - Enabled`,
          submissionDate: "01/01/2024",
          makoChangedDate: "02/01/2024",
          raiRequestedDate: "03/01/2024",
          raiReceivedDate: "04/01/2024",
        },
      ],
      [
        "an item with RAI Withdraw disabled",
        RAI_WITHDRAW_DISABLED_ITEM._source,
        {
          hasActions: false,
          status: RAI_WITHDRAW_DISABLED_ITEM._source.cmsStatus,
          submissionDate: "01/01/2024",
          makoChangedDate: "02/01/2024",
          raiRequestedDate: "03/01/2024",
          raiReceivedDate: "04/01/2024",
        },
      ],
      [
        "an item that is approved",
        APPROVED_ITEM._source,
        {
          hasActions: false,
          status: APPROVED_ITEM._source.cmsStatus,
          submissionDate: "01/01/2024",
          makoChangedDate: "02/01/2024",
          finalDispositionDate: "05/01/2024",
        },
      ],
      [
        "a blank item",
        BLANK_ITEM._source as opensearch.main.Document,
        {
          hasActions: false,
          status: BLANK_ITEM._source.cmsStatus,
        },
      ],
    ])("should display the correct values for a row with %s", (title, doc, expected) => {
      verifyRow(doc, expected);
    });

    it("should handle export", async () => {
      const spy = vi.spyOn(ExportToCsv.prototype, "generateCsv").mockImplementation(() => {});

      await userEvent.click(screen.queryByTestId("tooltip-trigger"));

      const expectedData = getExpectedExportData(true);
      expect(spy).toHaveBeenCalledWith(expectedData);
    });
  });
});
