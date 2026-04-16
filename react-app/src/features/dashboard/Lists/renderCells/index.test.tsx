import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  TEST_1915B_ITEM,
  TEST_1915C_ITEM,
  TEST_CHIP_SPA_ITEM,
  TEST_MED_SPA_ITEM,
  TEST_REVIEWER_USER,
  TEST_STATE_SUBMITTER_USER,
} from "mocks";
import { Action, CognitoUserAttributes, opensearch, SEATOOL_STATUS } from "shared-types";
import { UserRole } from "shared-types/events/legacy-user";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { queryClient } from "@/utils";
import {
  DRAFT_CONTINUE_ACTION_LABEL,
  DRAFT_DELETE_ACTION_LABEL,
  DRAFT_DELETE_MODAL_BODY,
  DRAFT_DELETE_MODAL_HEADER,
  getNonOwnerDraftDeleteModalBody,
} from "@/utils/drafts";
import {
  renderWithMemoryRouter,
  renderWithQueryClient,
  renderWithQueryClientAndMemoryRouter,
} from "@/utils/test-helpers";

import { CellDetailsLink, renderCellActions, renderCellDate } from "./index";

vi.mock("@/api", async () => {
  const actual = await vi.importActual<typeof import("@/api")>("@/api");
  return {
    ...actual,
  };
});

vi.mock("@/api/deleteDraft", () => ({
  deleteDraft: vi.fn(),
}));

vi.mock("@/components", async () => {
  const actual = await vi.importActual<typeof import("@/components")>("@/components");
  return {
    ...actual,
    banner: vi.fn(),
    userPrompt: vi.fn(),
  };
});

vi.mock("@/utils/ReactGA/SendGAEvent", () => ({
  sendGAEvent: vi.fn(),
}));

const { banner, userPrompt } = await import("@/components");
const { deleteDraft } = await import("@/api/deleteDraft");
const { sendGAEvent } = await import("@/utils/ReactGA/SendGAEvent");
import { MemoryRouter } from "react-router";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("CellDetailsLink GA event", () => {
  it("should send GA event when link is clicked", async () => {
    const user = userEvent.setup();
    const item = TEST_MED_SPA_ITEM._source;

    render(
      <MemoryRouter>
        <CellDetailsLink record={item} />
      </MemoryRouter>,
    );

    const link = screen.getByRole("link", { name: item.id });
    await user.click(link);

    expect(sendGAEvent).toHaveBeenCalledWith("dash_package_link", {
      package_type: item.authority,
      package_id: item.id,
    });
  });
});

describe("renderCellActions GA event", () => {
  it("should send GA event when an action is clicked", async () => {
    const user = userEvent.setup();

    const item: opensearch.main.Document = {
      ...TEST_MED_SPA_ITEM._source,
      seatoolStatus: SEATOOL_STATUS.PENDING_RAI,
      raiRequestedDate: "2024-01-01T00:00:00.000Z",
    };

    const cell = renderCellActions({ ...TEST_STATE_SUBMITTER_USER, role: "statesubmitter" })(item);

    renderWithQueryClient(cell);

    await user.click(screen.getByLabelText("Available package actions"));

    const actionLink = screen.getByText("Respond to Formal RAI");
    await user.click(actionLink);

    expect(sendGAEvent).toHaveBeenCalledWith("dash_ellipsis_click", {
      action: Action.RESPOND_TO_RAI,
    });
  });
});

describe("renderCells", () => {
  describe("renderCellDate", () => {
    it("should return a date string formatted for seatool", () => {
      expect(renderCellDate("changedDate")(TEST_MED_SPA_ITEM._source)).toEqual("11/26/2024");
    });
    it("should return null if the field is undefined", () => {
      expect(renderCellDate("raiRequestedDate")(TEST_MED_SPA_ITEM._source)).toBeNull();
    });
  });

  describe("CellDetailsLink", () => {
    const setup = (item: opensearch.main.Document) => {
      renderWithMemoryRouter(
        <CellDetailsLink record={item} />,
        [
          {
            path: "/test",
            element: <CellDetailsLink record={item} />,
          },
        ],
        {
          initialEntries: ["/test"],
        },
      );
    };
    it("should return a link for cell details for a Medicaid SPA item", () => {
      setup(TEST_MED_SPA_ITEM._source);
      expect(screen.getByText(TEST_MED_SPA_ITEM._source.id).getAttribute("href")).toEqual(
        `/details/${encodeURIComponent(TEST_MED_SPA_ITEM._source.authority)}/${encodeURIComponent(TEST_MED_SPA_ITEM._source.id)}`,
      );
    });
    it("should return a link for cell details for a CHIP SPA item", () => {
      setup(TEST_CHIP_SPA_ITEM._source);
      expect(screen.getByText(TEST_CHIP_SPA_ITEM._source.id).getAttribute("href")).toEqual(
        `/details/${encodeURIComponent(TEST_CHIP_SPA_ITEM._source.authority)}/${encodeURIComponent(TEST_CHIP_SPA_ITEM._source.id)}`,
      );
    });
    it("should return a link for cell details for a 1915(c) waiver item", () => {
      setup(TEST_1915B_ITEM._source);
      expect(screen.getByText(TEST_1915B_ITEM._source.id).getAttribute("href")).toEqual(
        `/details/${encodeURIComponent(TEST_1915B_ITEM._source.authority)}/${encodeURIComponent(TEST_1915B_ITEM._source.id)}`,
      );
    });
    it("should return a link for cell details for a 1915(c) waiver item", () => {
      setup(TEST_1915C_ITEM._source);
      expect(screen.getByText(TEST_1915C_ITEM._source.id).getAttribute("href")).toEqual(
        `/details/${encodeURIComponent(TEST_1915C_ITEM._source.authority)}/${encodeURIComponent(TEST_1915C_ITEM._source.id)}`,
      );
    });
    it("should return a link to details for draft items", () => {
      const draftItem: opensearch.main.Document = {
        ...TEST_MED_SPA_ITEM._source,
        seatoolStatus: SEATOOL_STATUS.DRAFT,
        event: "new-medicaid-submission",
      };
      setup(draftItem);
      expect(screen.getByText(draftItem.id).getAttribute("href")).toEqual(
        `/details/${encodeURIComponent(draftItem.authority)}/${encodeURIComponent(draftItem.id)}?preferDraft=true`,
      );
    });
  });

  describe("renderCellActions", () => {
    const setup = (
      userAttributes: CognitoUserAttributes | null,
      role: UserRole | null,
      item: opensearch.main.Document,
    ) => {
      const user = userEvent.setup();
      const element = renderCellActions(role ? { ...userAttributes, role } : null)(item);
      const rendered = renderWithQueryClientAndMemoryRouter(
        element,
        [
          {
            path: "/test",
            element: <div>{element}</div>,
          },
        ],
        {
          initialEntries: ["/test"],
        },
      );
      return {
        user,
        ...rendered,
      };
    };
    const getUrl = (action: Action, item: opensearch.main.Document) =>
      `/actions/${action}/${item.authority}/${item.id}?origin=dashboard`;

    it("should display button only initially", () => {
      setup(TEST_STATE_SUBMITTER_USER, "statesubmitter", TEST_MED_SPA_ITEM._source);
      expect(screen.queryByLabelText("Available package actions")).toBeInTheDocument();
    });

    it("should return null if there is no user", () => {
      const { container } = setup(null, null, TEST_CHIP_SPA_ITEM._source);
      expect(container.childElementCount).toEqual(1);
      expect(container.firstElementChild.childElementCount).toEqual(0);
    });

    describe("as a State Submitter", () => {
      const draftItem: opensearch.main.Document = {
        ...TEST_MED_SPA_ITEM._source,
        seatoolStatus: SEATOOL_STATUS.DRAFT,
        stateStatus: "Draft",
        cmsStatus: "Draft",
        event: "new-medicaid-submission",
        draft: {
          savedAt: "2026-03-26T00:00:00.000Z",
          createdByEmail: TEST_STATE_SUBMITTER_USER.email,
          createdByName: "State Submitter",
          data: {},
        },
      };

      it("should show draft actions for draft records", async () => {
        const { user } = setup(TEST_STATE_SUBMITTER_USER, "statesubmitter", draftItem);

        await user.click(screen.getByLabelText("Available package actions"));

        expect(await screen.findByText(DRAFT_CONTINUE_ACTION_LABEL)).toHaveAttribute(
          "href",
          `/new-submission/spa/medicaid/create?draftId=${draftItem.id}&origin=spas`,
        );
        expect(
          screen.getByRole("menuitem", {
            name: `${DRAFT_DELETE_ACTION_LABEL} for ${draftItem.id}`,
          }),
        ).toBeInTheDocument();
      });

      it("should open a delete confirmation modal for draft actions", async () => {
        const { user } = setup(TEST_STATE_SUBMITTER_USER, "statesubmitter", draftItem);

        await user.click(screen.getByLabelText("Available package actions"));
        await user.click(
          screen.getByRole("menuitem", {
            name: `${DRAFT_DELETE_ACTION_LABEL} for ${draftItem.id}`,
          }),
        );

        expect(userPrompt).toHaveBeenCalledWith(
          expect.objectContaining({
            header: DRAFT_DELETE_MODAL_HEADER,
            body: DRAFT_DELETE_MODAL_BODY,
            acceptButtonText: "Delete",
            cancelButtonText: "Cancel",
            cancelVariant: "link",
          }),
        );
      });

      it("should show owner-aware delete copy for non-owner draft users", async () => {
        const nonOwnerDraftItem: opensearch.main.Document = {
          ...draftItem,
          draft: {
            savedAt: "2026-03-26T00:00:00.000Z",
            draftOwnerEmail: "someoneelse@example.com",
            draftOwnerName: "Someone Else",
            data: {},
          },
        };

        const { user } = setup(TEST_STATE_SUBMITTER_USER, "statesubmitter", nonOwnerDraftItem);

        await user.click(screen.getByLabelText("Available package actions"));
        await user.click(
          screen.getByRole("menuitem", {
            name: `${DRAFT_DELETE_ACTION_LABEL} for ${nonOwnerDraftItem.id}`,
          }),
        );

        expect(userPrompt).toHaveBeenCalledWith(
          expect.objectContaining({
            header: DRAFT_DELETE_MODAL_HEADER,
            body: getNonOwnerDraftDeleteModalBody(nonOwnerDraftItem.id),
            acceptButtonText: "Delete",
            cancelButtonText: "Cancel",
            cancelVariant: "link",
          }),
        );
      });

      it("should keep users on the dashboard when delete modal is canceled", async () => {
        const { user } = setup(TEST_STATE_SUBMITTER_USER, "statesubmitter", draftItem);

        await user.click(screen.getByLabelText("Available package actions"));
        await user.click(
          screen.getByRole("menuitem", {
            name: `${DRAFT_DELETE_ACTION_LABEL} for ${draftItem.id}`,
          }),
        );

        const promptData = vi.mocked(userPrompt).mock.calls.at(-1)?.[0];
        expect(promptData).toBeDefined();

        promptData?.onCancel?.();

        expect(deleteDraft).not.toHaveBeenCalled();
        expect(banner).not.toHaveBeenCalled();
      });

      it("should delete the draft when confirmed", async () => {
        const { user } = setup(TEST_STATE_SUBMITTER_USER, "statesubmitter", draftItem);
        vi.mocked(deleteDraft).mockResolvedValueOnce(undefined);
        const removeQueriesSpy = vi.spyOn(queryClient, "removeQueries");

        await user.click(screen.getByLabelText("Available package actions"));
        await user.click(
          screen.getByRole("menuitem", {
            name: `${DRAFT_DELETE_ACTION_LABEL} for ${draftItem.id}`,
          }),
        );

        const promptData = vi.mocked(userPrompt).mock.calls.at(-1)?.[0];
        expect(promptData).toBeDefined();

        await promptData?.onAccept?.();

        await waitFor(() => {
          expect(deleteDraft).toHaveBeenCalledWith(draftItem.id);
          expect(removeQueriesSpy).toHaveBeenCalledWith({
            queryKey: ["record", draftItem.id],
          });
          expect(banner).toHaveBeenCalled();
        });
      });

      it(`should handle button click and display [${Action.RESPOND_TO_RAI},${Action.WITHDRAW_PACKAGE}]`, async () => {
        const { user } = setup(TEST_STATE_SUBMITTER_USER, "statesubmitter", {
          ...TEST_MED_SPA_ITEM._source,
          seatoolStatus: SEATOOL_STATUS.PENDING_RAI,
          raiRequestedDate: "2024-01-01T00:00:00.000Z",
        });
        await user.click(screen.getByLabelText("Available package actions"));
        expect(screen.queryByText("Respond to Formal RAI")).toBeInTheDocument();
        expect(screen.getByText("Respond to Formal RAI").getAttribute("href")).toEqual(
          getUrl(Action.RESPOND_TO_RAI, TEST_MED_SPA_ITEM._source),
        );
        expect(screen.queryByText("Withdraw Package")).toBeInTheDocument();
        expect(screen.getByText("Withdraw Package").getAttribute("href")).toEqual(
          getUrl(Action.WITHDRAW_PACKAGE, TEST_MED_SPA_ITEM._source),
        );
      });

      it(`should handle button click and display [${Action.TEMP_EXTENSION}, ${Action.AMEND_WAIVER}]`, async () => {
        const { user } = setup(TEST_STATE_SUBMITTER_USER, "statesubmitter", {
          ...TEST_1915B_ITEM._source,
          actionType: "New",
          seatoolStatus: SEATOOL_STATUS.APPROVED,
        });
        await user.click(screen.getByLabelText("Available package actions"));

        expect(screen.queryByText("Request Temporary Extension")).toBeInTheDocument();
        expect(screen.getByText("Request Temporary Extension").getAttribute("href")).toEqual(
          getUrl(Action.TEMP_EXTENSION, TEST_1915B_ITEM._source),
        );
        expect(screen.queryByText("Add Amendment")).toBeInTheDocument();
        expect(screen.getByText("Add Amendment").getAttribute("href")).toEqual(
          getUrl(Action.AMEND_WAIVER, TEST_1915B_ITEM._source),
        );
      });

      it(`should handle button click and display [${Action.WITHDRAW_RAI}, ${Action.WITHDRAW_PACKAGE}, ${Action.UPLOAD_SUBSEQUENT_DOCUMENTS}]`, async () => {
        const { user } = setup(TEST_STATE_SUBMITTER_USER, "statesubmitter", {
          ...TEST_MED_SPA_ITEM._source,
          seatoolStatus: SEATOOL_STATUS.PENDING,
          actionType: "New",
          raiRequestedDate: "2024-01-01T00:00:00.000Z",
          raiReceivedDate: "2024-01-01T00:00:00.000Z",
          raiWithdrawEnabled: true,
        });
        await user.click(screen.getByLabelText("Available package actions"));

        expect(screen.queryByText("Withdraw Formal RAI Response")).toBeInTheDocument();
        expect(screen.getByText("Withdraw Formal RAI Response").getAttribute("href")).toEqual(
          getUrl(Action.WITHDRAW_RAI, TEST_MED_SPA_ITEM._source),
        );
        expect(screen.queryByText("Withdraw Package")).toBeInTheDocument();
        expect(screen.getByText("Withdraw Package").getAttribute("href")).toEqual(
          getUrl(Action.WITHDRAW_PACKAGE, TEST_MED_SPA_ITEM._source),
        );
        expect(screen.queryByText("Upload Subsequent Documents")).toBeInTheDocument();
        expect(screen.getByText("Upload Subsequent Documents").getAttribute("href")).toEqual(
          getUrl(Action.UPLOAD_SUBSEQUENT_DOCUMENTS, TEST_MED_SPA_ITEM._source),
        );
      });

      it(`should handle button click and display [${Action.WITHDRAW_PACKAGE}, ${Action.UPLOAD_SUBSEQUENT_DOCUMENTS}]`, async () => {
        const { user } = setup(TEST_STATE_SUBMITTER_USER, "statesubmitter", {
          ...TEST_MED_SPA_ITEM._source,
          seatoolStatus: SEATOOL_STATUS.PENDING,
          actionType: "New",
          raiWithdrawEnabled: true,
        });
        await user.click(screen.getByLabelText("Available package actions"));

        expect(screen.queryByText("Withdraw Package")).toBeInTheDocument();
        expect(screen.getByText("Withdraw Package").getAttribute("href")).toEqual(
          getUrl(Action.WITHDRAW_PACKAGE, TEST_MED_SPA_ITEM._source),
        );
        expect(screen.queryByText("Upload Subsequent Documents")).toBeInTheDocument();
        expect(screen.getByText("Upload Subsequent Documents").getAttribute("href")).toEqual(
          getUrl(Action.UPLOAD_SUBSEQUENT_DOCUMENTS, TEST_MED_SPA_ITEM._source),
        );
      });
    });

    describe("as a CMS Reviewer", () => {
      it(`should handle a button click and display [${Action.ENABLE_RAI_WITHDRAW}]`, async () => {
        const { user } = setup(TEST_REVIEWER_USER, "cmsreviewer", {
          ...TEST_CHIP_SPA_ITEM._source,
          seatoolStatus: SEATOOL_STATUS.PENDING,
          actionType: "New",
          raiRequestedDate: "2024-01-01T00:00:00.000Z",
          raiReceivedDate: "2024-01-01T00:00:00.000Z",
        });
        await user.click(screen.getByLabelText("Available package actions"));

        expect(screen.queryByText("Enable Formal RAI Response Withdraw")).toBeInTheDocument();
        expect(
          screen.getByText("Enable Formal RAI Response Withdraw").getAttribute("href"),
        ).toEqual(getUrl(Action.ENABLE_RAI_WITHDRAW, TEST_CHIP_SPA_ITEM._source));
      });

      it(`should handle a button click and display [${Action.DISABLE_RAI_WITHDRAW}]`, async () => {
        const { user } = setup(TEST_REVIEWER_USER, "cmsreviewer", {
          ...TEST_MED_SPA_ITEM._source,
          seatoolStatus: SEATOOL_STATUS.PENDING,
          actionType: "New",
          raiRequestedDate: "2024-01-01T00:00:00.000Z",
          raiReceivedDate: "2024-01-01T00:00:00.000Z",
          raiWithdrawEnabled: true,
        });
        await user.click(screen.getByLabelText("Available package actions"));

        expect(screen.queryByText("Disable Formal RAI Response Withdraw")).toBeInTheDocument();
        expect(
          screen.getByText("Disable Formal RAI Response Withdraw").getAttribute("href"),
        ).toEqual(getUrl(Action.DISABLE_RAI_WITHDRAW, TEST_MED_SPA_ITEM._source));
      });
    });
  });
});
