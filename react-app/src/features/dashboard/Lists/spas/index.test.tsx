import { cleanup, screen, waitForElementToBeRemoved, within } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { ExportToCsv } from "export-to-csv";
import {
  setMockUsername,
  TEST_CMS_REVIEWER_USER,
  TEST_DEFAULT_CMS_USER,
  TEST_HELP_DESK_USER,
  TEST_STATE_SUBMITTER_USER,
} from "mocks";
import { opensearch } from "shared-types";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@/api";
import { BLANK_VALUE } from "@/consts";
import {
  APPROVED_ITEM,
  APPROVED_ITEM_EXPORT,
  BLANK_ITEM,
  BLANK_ITEM_EXPORT,
  getDashboardQueryString,
  PENDING_RAI_RECEIVED_ITEM,
  PENDING_RAI_RECEIVED_ITEM_EXPORT,
  PENDING_RAI_REQUEST_ITEM,
  PENDING_RAI_REQUEST_ITEM_EXPORT,
  PENDING_SUBMITTED_ITEM,
  PENDING_SUBMITTED_ITEM_EXPORT,
  RAI_WITHDRAW_DISABLED_ITEM,
  RAI_WITHDRAW_DISABLED_ITEM_EXPORT,
  RAI_WITHDRAW_ENABLED_ITEM,
  RAI_WITHDRAW_ENABLED_ITEM_EXPORT,
  renderDashboard,
  skipCleanup,
  Storage,
  verifyChips,
  verifyFiltering,
  verifyPagination,
} from "@/utils/test-helpers";

import { SpasList } from "./index";

const pendingDoc = {
  ...PENDING_SUBMITTED_ITEM._source,
  authority: "Medicaid SPA",
} as opensearch.main.Document;
const raiRequestDoc = {
  ...PENDING_RAI_REQUEST_ITEM._source,
  authority: "CHIP SPA",
} as opensearch.main.Document;
const raiReceivedDoc = {
  ...PENDING_RAI_RECEIVED_ITEM._source,
  authority: "Medicaid SPA",
} as opensearch.main.Document;
const withdrawEnabledDoc = {
  ...RAI_WITHDRAW_ENABLED_ITEM._source,
  authority: "Chip SPA",
} as opensearch.main.Document;
const withdrawDisabledDoc = {
  ...RAI_WITHDRAW_DISABLED_ITEM._source,
  authority: "Medicaid SPA",
} as opensearch.main.Document;
const approvedDoc = {
  ...APPROVED_ITEM._source,
  authority: "CHIP SPA",
} as opensearch.main.Document;
const blankDoc = BLANK_ITEM._source as opensearch.main.Document;

const items = [
  {
    _id: pendingDoc.id,
    _source: pendingDoc,
  },
  {
    _id: raiRequestDoc.id,
    _source: raiRequestDoc,
  },
  {
    _id: raiReceivedDoc.id,
    _source: raiReceivedDoc,
  },
  {
    _id: withdrawEnabledDoc.id,
    _source: withdrawEnabledDoc,
  },
  {
    _id: withdrawDisabledDoc.id,
    _source: withdrawDisabledDoc,
  },
  {
    _id: approvedDoc.id,
    _source: approvedDoc,
  },
  {
    _id: blankDoc.id,
    _source: blankDoc,
  },
] as opensearch.Hit<opensearch.main.Document>[];
const hitCount = items.length;
const defaultHits: opensearch.Hits<opensearch.main.Document> = {
  hits: items,
  max_score: 5,
  total: { value: hitCount, relation: "eq" },
};

const getExpectedExportData = (useCmsStatus: boolean) => {
  return [
    {
      ...PENDING_SUBMITTED_ITEM_EXPORT,
      Authority: pendingDoc.authority,
      "SPA ID": pendingDoc.id,
      Status: useCmsStatus ? pendingDoc.cmsStatus : pendingDoc.stateStatus,
    },
    {
      ...PENDING_RAI_REQUEST_ITEM_EXPORT,
      Authority: raiRequestDoc.authority,
      "SPA ID": raiRequestDoc.id,
      Status: useCmsStatus ? raiRequestDoc.cmsStatus : raiRequestDoc.stateStatus,
    },
    {
      ...PENDING_RAI_RECEIVED_ITEM_EXPORT,
      Authority: raiReceivedDoc.authority,
      "SPA ID": raiReceivedDoc.id,
      Status: useCmsStatus ? raiReceivedDoc.cmsStatus : raiReceivedDoc.stateStatus,
    },
    {
      ...RAI_WITHDRAW_ENABLED_ITEM_EXPORT,
      Authority: withdrawEnabledDoc.authority,
      "SPA ID": withdrawEnabledDoc.id,
      Status: `${useCmsStatus ? withdrawEnabledDoc.cmsStatus : withdrawEnabledDoc.stateStatus} (Withdraw Formal RAI Response - Enabled)`,
    },
    {
      ...RAI_WITHDRAW_DISABLED_ITEM_EXPORT,
      Authority: withdrawDisabledDoc.authority,
      "SPA ID": withdrawDisabledDoc.id,
      Status: useCmsStatus ? withdrawDisabledDoc.cmsStatus : withdrawDisabledDoc.stateStatus,
    },
    {
      ...APPROVED_ITEM_EXPORT,
      Authority: approvedDoc.authority,
      "SPA ID": approvedDoc.id,
      Status: useCmsStatus ? approvedDoc.cmsStatus : approvedDoc.stateStatus,
    },
    {
      ...BLANK_ITEM_EXPORT,
      "SPA ID": blankDoc.id,
      Status: useCmsStatus ? blankDoc.cmsStatus : blankDoc.stateStatus,
    },
  ];
};

const verifyColumns = (hasActions: boolean) => {
  const table = screen.getByTestId("os-table");

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
  const row = within(screen.getByTestId("os-table")).getByText(doc.id).parentElement.parentElement;
  const cells = row.children;
  let cellIndex = hasActions ? 1 : 0;

  if (hasActions) {
    // Actions
    expect(within(row).getByTestId("available-actions"));
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
    global.localStorage = new Storage();
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

    const table = screen.getByTestId("os-table");
    expect(table.firstElementChild.firstElementChild.childElementCount).toEqual(0);
  });

  describe.each([
    ["State Submitter", TEST_STATE_SUBMITTER_USER.username, true, false],
    ["CMS Reviewer", TEST_CMS_REVIEWER_USER.username, true, true],
    ["Default CMS User", TEST_DEFAULT_CMS_USER.username, true, true],
    ["CMS Help Desk User", TEST_HELP_DESK_USER.username, false, false],
  ])("as a %s", async (_title, username, hasActions, useCmsStatus) => {
    let user: UserEvent;
    beforeAll(async () => {
      skipCleanup();

      setMockUsername(username);

      ({ user } = await setup(
        defaultHits,
        getDashboardQueryString({
          tab: "spas",
        }),
      ));
    });

    beforeEach(() => {
      setMockUsername(username);
    });

    afterAll(() => {
      cleanup();
    });

    it("should display the dashboard as expected", async () => {
      verifyFiltering(3); // 4 hidden columns
      verifyChips([]); // no filters
      verifyColumns(hasActions);
      verifyPagination(hitCount);
    });

    it("should handle showing all of the columns", async () => {
      // show all the hidden columns
      await user.click(screen.queryByRole("button", { name: "Columns (3 hidden)" }));
      const columns = screen.getByTestId("columns-menu");
      await user.click(within(columns).getByText("Final Disposition"));
      await user.click(within(columns).getByText("Formal RAI Requested"));
      await user.click(within(columns).getByText("CPOC Name"));

      const table = screen.getByTestId("os-table");
      expect(
        within(table).getByText("Final Disposition", { selector: "th>div" }),
      ).toBeInTheDocument();
      expect(
        within(table).getByText("Formal RAI Requested", { selector: "th>div" }),
      ).toBeInTheDocument();
      expect(within(table).getByText("CPOC Name", { selector: "th>div" })).toBeInTheDocument();
    });

    it.each([
      [
        "a new item that is pending without RAI",
        pendingDoc,
        {
          hasActions,
          status: useCmsStatus ? pendingDoc.cmsStatus : pendingDoc.stateStatus,
          submissionDate: "01/01/2024",
          makoChangedDate: "02/01/2024",
        },
      ],
      [
        "an item that has requested an RAI",
        raiRequestDoc,
        {
          hasActions,
          status: useCmsStatus ? raiRequestDoc.cmsStatus : raiRequestDoc.stateStatus,
          submissionDate: "01/01/2024",
          makoChangedDate: "02/01/2024",
          raiRequestedDate: "03/01/2024",
        },
      ],
      [
        "an item that has received an RAI",
        raiReceivedDoc,
        {
          hasActions,
          status: useCmsStatus ? raiReceivedDoc.cmsStatus : raiReceivedDoc.stateStatus,
          submissionDate: "01/01/2024",
          makoChangedDate: "02/01/2024",
          raiRequestedDate: "03/01/2024",
          raiReceivedDate: "04/01/2024",
        },
      ],
      [
        "an item that has RAI Withdraw enabled",
        withdrawEnabledDoc,
        {
          hasActions,
          status: `${useCmsStatus ? withdrawEnabledDoc.cmsStatus : withdrawEnabledDoc.stateStatus}· Withdraw Formal RAI Response - Enabled`,
          submissionDate: "01/01/2024",
          makoChangedDate: "02/01/2024",
          raiRequestedDate: "03/01/2024",
          raiReceivedDate: "04/01/2024",
        },
      ],
      [
        "an item with RAI Withdraw disabled",
        withdrawDisabledDoc,
        {
          hasActions,
          status: useCmsStatus ? withdrawDisabledDoc.cmsStatus : withdrawDisabledDoc.stateStatus,
          submissionDate: "01/01/2024",
          makoChangedDate: "02/01/2024",
          raiRequestedDate: "03/01/2024",
          raiReceivedDate: "04/01/2024",
        },
      ],
      [
        "an item that is approved",
        approvedDoc,
        {
          hasActions,
          status: useCmsStatus ? approvedDoc.cmsStatus : approvedDoc.stateStatus,
          submissionDate: "01/01/2024",
          makoChangedDate: "02/01/2024",
          finalDispositionDate: "05/01/2024",
        },
      ],
      [
        "a blank item",
        blankDoc,
        {
          hasActions,
          status: useCmsStatus ? blankDoc.cmsStatus : blankDoc.stateStatus,
        },
      ],
    ])("should display the correct values for a row with %s", (_title, doc, expected) => {
      verifyRow(doc, expected);
    });

    it("should handle export", async () => {
      const spy = vi.spyOn(ExportToCsv.prototype, "generateCsv").mockImplementation(() => {});

      await user.keyboard("{Escape}"); // ⚠️ close columns menu after testing

      await user.click(screen.getByTestId("export-csv-btn"));

      const expectedData = getExpectedExportData(useCmsStatus);
      expect(spy).toHaveBeenCalledWith(expectedData);
    });
  });
});
