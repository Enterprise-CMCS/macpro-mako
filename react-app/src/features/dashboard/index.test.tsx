import { describe, expect, it, vi, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import {
  screen,
  within,
  waitForElementToBeRemoved,
  cleanup,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  renderWithQueryClientAndMemoryRouter,
  verifyFiltering,
  verifyChips,
  verifyPagination,
  getFilteredHits,
  skipCleanup,
  createTestQueryClient,
} from "@/utils/test-helpers";
import {
  TEST_STATE_SUBMITTER_USER,
  TEST_CMS_REVIEWER_USER,
  TEST_HELP_DESK_USER,
  TEST_READ_ONLY_USER,
  setMockUsername,
  errorApiSearchHandler,
} from "mocks";
import { mockedApiServer as mockedServer } from "mocks/server";
import { Dashboard, dashboardLoader } from "./index";
import { redirect } from "react-router";

const spaHits = getFilteredHits(["Medicaid SPA", "CHIP SPA"]);
const waiverHits = getFilteredHits(["1915(b)", "1915(c)"]);

const verifyColumns = (table, hasActions: boolean, isWaiver: boolean, hitCount: number) => {
  let columnCount = 8;
  if (hasActions) columnCount++;
  if (isWaiver) columnCount++;

  if (hasActions) {
    expect(within(table).getByText("Actions", { selector: "th>div" })).toBeInTheDocument();
  }
  expect(within(table).getByText("State", { selector: "th>div" })).toBeInTheDocument();
  expect(within(table).getByText("Authority", { selector: "th>div" })).toBeInTheDocument();
  if (isWaiver) {
    expect(within(table).getByText("Waiver Number", { selector: "th>div" })).toBeInTheDocument();
    expect(within(table).getByText("Action Type", { selector: "th>div" })).toBeInTheDocument();
  } else {
    expect(within(table).getByText("SPA ID", { selector: "th>div" })).toBeInTheDocument();
  }
  expect(within(table).getByText("Status", { selector: "th>div" })).toBeInTheDocument();
  expect(within(table).getByText("Initial Submission", { selector: "th>div" })).toBeInTheDocument();
  expect(
    within(table).getByText("Latest Package Activity", { selector: "th>div" }),
  ).toBeInTheDocument();
  expect(
    within(table).getByText("Formal RAI Response", { selector: "th>div" }),
  ).toBeInTheDocument();
  expect(within(table).getByText("Submitted By", { selector: "th>div" })).toBeInTheDocument();
  expect(table.firstElementChild.firstElementChild.childElementCount).toEqual(columnCount);

  // Check that the correct amount rows appear
  expect(screen.getAllByRole("row").length).toEqual(hitCount + 1); // add 1 for header
};

describe("Dashboard", () => {
  const setup = async () => {
    const user = userEvent.setup();
    const rendered = renderWithQueryClientAndMemoryRouter(
      <Dashboard />,
      [
        {
          path: "/dashboard",
          element: <Dashboard />,
        },
        {
          path: "/",
          element: <div data-testid="home">Home</div>,
        },
        {
          path: "/new-submission",
          element: <div data-testid="new-submission">New Submission</div>,
        },
      ],
      {
        initialEntries: [
          {
            pathname: "/dashboard",
          },
        ],
      },
    );
    if (screen.queryAllByLabelText("three-dots-loading")?.length > 0) {
      await waitForElementToBeRemoved(() => screen.queryAllByLabelText("three-dots-loading"));
    }
    return {
      user,
      ...rendered,
    };
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should navigate to home page if the user is not logged in", async () => {
    setMockUsername(null);

    await setup();

    await screen.findByTestId("home");

    expect(screen.queryByTestId("home")).toBeInTheDocument();
  });

  it("should handle an error from Opensearch", async () => {
    setMockUsername(TEST_STATE_SUBMITTER_USER.username);
    mockedServer.use(errorApiSearchHandler);

    await setup();

    expect(screen.queryByRole("heading", { level: 1, name: "Dashboard" })).toBeInTheDocument();

    expect(screen.queryByTestId("filtering")).toBeNull();
    expect(screen.queryByTestId("chips")).toBeNull();
    expect(screen.queryByTestId("pagination")).toBeNull();

    const spaTab = screen.queryByRole("heading", { level: 2, name: "SPAs" });
    expect(spaTab).toBeInTheDocument();
    expect(spaTab.parentElement.getAttribute("aria-selected")).toEqual("true");

    const waiverTab = screen.queryByRole("heading", { level: 2, name: "Waivers" });
    expect(waiverTab).toBeInTheDocument();
    expect(waiverTab.parentElement.getAttribute("aria-selected")).toEqual("false");

    expect(screen.getByRole("tabpanel").textContent).toEqual("ErrorAn error has occurred");
  });

  describe("as a State Submitter", () => {
    let user;
    const hasActions = true;

    beforeAll(async () => {
      skipCleanup();

      setMockUsername(TEST_STATE_SUBMITTER_USER.username);

      ({ user } = await setup());
    });

    beforeEach(() => {
      setMockUsername(TEST_STATE_SUBMITTER_USER.username);
    });

    afterAll(() => {
      cleanup();
    });

    it("should display the dashboard correctly", async () => {
      expect(screen.queryByRole("heading", { level: 1, name: "Dashboard" })).toBeInTheDocument();
      verifyFiltering(3); // 4 hidden columns by default
      verifyChips([]);
    });

    it("should display the SPA tab initially", async () => {
      const isWaiver = false;
      const spaTab = screen.queryByRole("heading", { level: 2, name: "SPAs" });
      expect(spaTab).toBeInTheDocument();
      expect(spaTab.parentElement.getAttribute("aria-selected")).toEqual("true");

      const waiverTab = screen.queryByRole("heading", { level: 2, name: "Waivers" });
      expect(waiverTab).toBeInTheDocument();
      expect(waiverTab.parentElement.getAttribute("aria-selected")).toEqual("false");

      const table = screen.getByRole("table");
      verifyColumns(table, hasActions, isWaiver, spaHits.total.value);
      verifyPagination(spaHits.total.value);
    });

    it("should handle switching to the Waiver tab", async () => {
      const isWaiver = true;

      await waitFor(async () => {
        const waiverTab = await screen.findByRole("heading", { level: 2, name: "Waivers" });
        await user.click(waiverTab.parentElement);

        expect(waiverTab).toBeInTheDocument();
        expect(waiverTab.parentElement.getAttribute("aria-selected")).toEqual("true");
      });

      const spaTab = screen.queryByRole("heading", { level: 2, name: "SPAs" });
      expect(spaTab).toBeInTheDocument();
      expect(spaTab.parentElement.getAttribute("aria-selected")).toEqual("false");

      const table = screen.getByRole("table");
      verifyColumns(table, hasActions, isWaiver, waiverHits.total.value);
      verifyPagination(waiverHits.total.value);
    });

    it("should handle switching back to the SPA tab", async () => {
      const isWaiver = false;

      await waitFor(async () => {
        const spaTab = await screen.findByRole("heading", { level: 2, name: "SPAs" });
        await user.click(spaTab.parentElement);

        expect(spaTab).toBeInTheDocument();
        expect(spaTab.parentElement.getAttribute("aria-selected")).toEqual("true");
      });

      const waiverTab = screen.queryByRole("heading", { level: 2, name: "Waivers" });
      expect(waiverTab).toBeInTheDocument();
      expect(waiverTab.parentElement.getAttribute("aria-selected")).toEqual("false");

      const table = screen.getByRole("table");
      verifyColumns(table, hasActions, isWaiver, spaHits.total.value);
      verifyPagination(spaHits.total.value);
    });

    it("should handle clicking the New Submission link", async () => {
      const newSubmissionLink = screen.queryByRole("link", { name: "New Submission" });
      expect(newSubmissionLink).toBeInTheDocument();

      await user.click(newSubmissionLink);

      expect(screen.queryByTestId("new-submission")).toBeInTheDocument();
    });
  });

  describe.each([
    ["CMS Reviewer", TEST_CMS_REVIEWER_USER.username, true],
    ["CMS Help Desk User", TEST_HELP_DESK_USER.username, false],
    ["CMS Read-Only User", TEST_READ_ONLY_USER.username, false],
  ])("as a %s", (title, username, hasActions) => {
    let user;
    beforeAll(async () => {
      skipCleanup();

      setMockUsername(username);

      ({ user } = await setup());
    });

    beforeEach(() => {
      setMockUsername(username);
    });

    afterAll(() => {
      cleanup();
    });

    it("should display the dashboard correctly", async () => {
      expect(screen.queryByRole("heading", { level: 1, name: "Dashboard" })).toBeInTheDocument();
      verifyFiltering(3); // 4 hidden columns by default
      verifyChips([]);

      expect(screen.queryByRole("link", { name: "New Submission" })).toBeNull();
    });

    it("should display the SPA tab initially", async () => {
      const isWaiver = false;
      const spaTab = screen.queryByRole("heading", { level: 2, name: "SPAs" });
      expect(spaTab).toBeInTheDocument();
      expect(spaTab.parentElement.getAttribute("aria-selected")).toEqual("true");

      const waiverTab = screen.queryByRole("heading", { level: 2, name: "Waivers" });
      expect(waiverTab).toBeInTheDocument();
      expect(waiverTab.parentElement.getAttribute("aria-selected")).toEqual("false");

      const table = screen.getByRole("table");
      verifyColumns(table, hasActions, isWaiver, spaHits.total.value);
      verifyPagination(spaHits.total.value);
    });

    it("should handle switching to the Waiver tab", async () => {
      const isWaiver = true;

      await waitFor(async () => {
        const waiverTab = await screen.findByRole("heading", { level: 2, name: "Waivers" });
        await user.click(waiverTab.parentElement);

        expect(waiverTab).toBeInTheDocument();
        expect(waiverTab.parentElement.getAttribute("aria-selected")).toEqual("true");
      });

      const spaTab = screen.queryByRole("heading", { level: 2, name: "SPAs" });
      expect(spaTab).toBeInTheDocument();
      expect(spaTab.parentElement.getAttribute("aria-selected")).toEqual("false");

      const table = screen.getByRole("table");
      verifyColumns(table, hasActions, isWaiver, waiverHits.total.value);
      verifyPagination(waiverHits.total.value);
    });

    it("should handle switching back to the SPA tab", async () => {
      const isWaiver = false;

      await waitFor(async () => {
        const spaTab = screen.queryByRole("heading", { level: 2, name: "SPAs" });
        await user.click(spaTab.parentElement);

        expect(spaTab).toBeInTheDocument();
        expect(spaTab.parentElement.getAttribute("aria-selected")).toEqual("true");
      });

      const waiverTab = screen.queryByRole("heading", { level: 2, name: "Waivers" });
      expect(waiverTab).toBeInTheDocument();
      expect(waiverTab.parentElement.getAttribute("aria-selected")).toEqual("false");

      const table = screen.getByRole("table");
      verifyColumns(table, hasActions, isWaiver, spaHits.total.value);
      verifyPagination(spaHits.total.value);
    });
  });

  describe("dashboardLoader", () => {
    vi.mock("react-router", { spy: true });
    it.each([
      ["State Submitter", TEST_STATE_SUBMITTER_USER, false],
      ["CMS Reviewer", TEST_CMS_REVIEWER_USER, true],
      ["CMS Help Desk User", TEST_HELP_DESK_USER, true],
      ["CMS Read-Only User", TEST_READ_ONLY_USER, true],
    ])("should load a %s", async (title, user, isCms) => {
      const queryClient = createTestQueryClient();
      setMockUsername(user.username);

      const result = await dashboardLoader(queryClient)();
      expect(result).toEqual({
        user,
        isCms,
      });

      expect(redirect).not.toHaveBeenCalled();
    });

    it("should redirect if user is not logged in", async () => {
      const queryClient = createTestQueryClient();
      setMockUsername(null);

      await dashboardLoader(queryClient)();

      expect(redirect).toHaveBeenCalledWith("/");
    });
  });
});
