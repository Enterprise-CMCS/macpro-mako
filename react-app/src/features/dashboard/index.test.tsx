import {
  cleanup,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import {
  DEFAULT_CMS_USER,
  errorApiSearchHandler,
  HELP_DESK_USER,
  setMockUsername,
  TEST_REVIEWER_USER,
  TEST_STATE_SUBMITTER_USER,
} from "mocks";
import { mockedApiServer as mockedServer } from "mocks/server";
import { redirect } from "react-router";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import * as ReactGA from "@/utils/ReactGA/SendGAEvent";
import {
  createTestQueryClient,
  getFilteredHits,
  renderWithQueryClientAndMemoryRouter,
  skipCleanup,
  verifyChips,
  verifyFiltering,
  verifyPagination,
} from "@/utils/test-helpers";

import { Dashboard, dashboardLoader } from "./index";

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

    const spaTab = screen.queryByRole("tab", { name: "SPAs" });
    expect(spaTab).toBeInTheDocument();
    expect(spaTab.getAttribute("aria-selected")).toEqual("true");

    const waiverTab = screen.queryByRole("tab", { name: "Waivers" });
    expect(waiverTab).toBeInTheDocument();
    expect(waiverTab.getAttribute("aria-selected")).toEqual("false");

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
      const spaTab = screen.queryByRole("tab", { name: "SPAs" });
      expect(spaTab).toBeInTheDocument();
      expect(spaTab.getAttribute("aria-selected")).toEqual("true");

      const waiverTab = screen.queryByRole("tab", { name: "Waivers" });
      expect(waiverTab).toBeInTheDocument();
      expect(waiverTab.getAttribute("aria-selected")).toEqual("false");

      const table = screen.getByTestId("os-table");
      verifyColumns(table, hasActions, isWaiver, spaHits.total.value);
      verifyPagination(spaHits.total.value);
    });

    it("should handle switching to the Waiver tab", async () => {
      const isWaiver = true;

      await waitFor(async () => {
        const waiverTab = await screen.findByRole("tab", { name: "Waivers" });
        await user.click(waiverTab);

        expect(waiverTab).toBeInTheDocument();
        expect(waiverTab.getAttribute("aria-selected")).toEqual("true");
      });

      const spaTab = screen.queryByRole("tab", { name: "SPAs" });
      expect(spaTab).toBeInTheDocument();
      expect(spaTab.getAttribute("aria-selected")).toEqual("false");

      const table = screen.getByTestId("os-table");
      verifyColumns(table, hasActions, isWaiver, waiverHits.total.value);
      verifyPagination(waiverHits.total.value);
    });

    it("should handle switching back to the SPA tab", async () => {
      const isWaiver = false;

      await waitFor(async () => {
        const spaTab = await screen.findByRole("tab", { name: "SPAs" });
        await user.click(spaTab);

        expect(spaTab).toBeInTheDocument();
        expect(spaTab.getAttribute("aria-selected")).toEqual("true");
      });

      const waiverTab = screen.queryByRole("tab", { name: "Waivers" });
      expect(waiverTab).toBeInTheDocument();
      expect(waiverTab.getAttribute("aria-selected")).toEqual("false");

      const table = screen.getByTestId("os-table");
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
    ["CMS Reviewer", TEST_REVIEWER_USER.username, true],
    ["Default CMS User", DEFAULT_CMS_USER.username, true],
    ["CMS Help Desk User", HELP_DESK_USER.username, false],
  ])("as a %s", (_title, username, hasActions) => {
    let user: UserEvent;
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
      const spaTab = screen.queryByRole("tab", { name: "SPAs" });
      expect(spaTab).toBeInTheDocument();
      expect(spaTab.getAttribute("aria-selected")).toEqual("true");

      const waiverTab = screen.queryByRole("tab", { name: "Waivers" });
      expect(waiverTab).toBeInTheDocument();
      expect(waiverTab.getAttribute("aria-selected")).toEqual("false");

      const table = screen.getByTestId("os-table");
      verifyColumns(table, hasActions, isWaiver, spaHits.total.value);
      verifyPagination(spaHits.total.value);
    });

    it("should handle switching to the Waiver tab", async () => {
      const isWaiver = true;

      await waitFor(async () => {
        const waiverTab = await screen.findByRole("tab", { name: "Waivers" });

        await user.click(waiverTab);

        expect(waiverTab).toBeInTheDocument();
        expect(waiverTab.getAttribute("aria-selected")).toEqual("true");
      });

      const spaTab = screen.queryByRole("tab", { name: "SPAs" });
      expect(spaTab).toBeInTheDocument();
      expect(spaTab.getAttribute("aria-selected")).toEqual("false");

      const table = screen.getByTestId("os-table");
      verifyColumns(table, hasActions, isWaiver, waiverHits.total.value);
      verifyPagination(waiverHits.total.value);
    });

    it("should handle switching back to the SPA tab", async () => {
      const isWaiver = false;

      await waitFor(async () => {
        const spaTab = screen.queryByRole("tab", { name: "SPAs" });
        await user.click(spaTab);

        expect(spaTab).toBeInTheDocument();
        expect(spaTab.getAttribute("aria-selected")).toEqual("true");
      });

      const waiverTab = screen.queryByRole("tab", { name: "Waivers" });
      expect(waiverTab).toBeInTheDocument();
      expect(waiverTab.getAttribute("aria-selected")).toEqual("false");

      const table = screen.getByTestId("os-table");
      verifyColumns(table, hasActions, isWaiver, spaHits.total.value);
      verifyPagination(spaHits.total.value);
    });
  });

  describe("dashboardLoader", () => {
    vi.mock("react-router", { spy: true });
    it.each([
      ["State Submitter", TEST_STATE_SUBMITTER_USER, false],
      ["CMS Reviewer", TEST_REVIEWER_USER, true],
      ["Default CMS Reviewer", DEFAULT_CMS_USER, true],
      ["CMS Help Desk User", HELP_DESK_USER, true],
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

      expect(redirect).toHaveBeenCalledWith("/login");
    });
  });
});

describe("GA events", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("should send GA event when New Submission is clicked", async () => {
    const sendGAEventSpy = vi.spyOn(ReactGA, "sendGAEvent").mockImplementation(() => {});

    const user = userEvent.setup();
    renderWithQueryClientAndMemoryRouter(
      <Dashboard />,
      [{ path: "/dashboard", element: <Dashboard /> }],
      { initialEntries: ["/dashboard"] },
    );

    // wait for the dashboard to load
    await screen.findByRole("heading", { name: "Dashboard" });

    const button = screen.getByTestId("new-sub-button");
    await user.click(button);

    expect(sendGAEventSpy).toHaveBeenCalledWith("new_submission_click", {
      event_category: "Dashboard",
      event_label: "from_dashboard",
    });
  });
});
