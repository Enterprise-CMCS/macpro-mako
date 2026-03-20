import { screen, waitFor } from "@testing-library/react";
import {
  EXISTING_ITEM_ID,
  onceApiPackageActionsHandler,
  setDefaultStateSubmitter,
  setMockUsername,
  TEST_1915B_ITEM,
  TEST_CHIP_SPA_ITEM,
  TEST_MED_SPA_ITEM,
  TEST_MED_SPA_RAI_ITEM,
  testReviewer,
} from "mocks";
import items from "mocks/data/items";
import { mockedApiServer as mockedServer } from "mocks/server";
import { Action, opensearch, SEATOOL_STATUS } from "shared-types";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mapActionLabel } from "@/utils";
import {
  DRAFT_CONTINUE_ACTION_LABEL,
  DRAFT_DELETE_ACTION_LABEL,
  DRAFT_DELETE_MODAL_BODY,
  DRAFT_DELETE_MODAL_HEADER,
  getNonOwnerDraftDeleteModalBody,
} from "@/utils/drafts";
import { renderFormWithPackageSectionAsync } from "@/utils/test-helpers/renderForm";

import { DetailCardWrapper } from "../../index";
import { PackageActionsCard } from "./index";

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}));

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/api", async () => {
  const actual = await vi.importActual<typeof import("@/api")>("@/api");
  return {
    ...actual,
    deleteDraft: vi.fn(),
  };
});

vi.mock("@/components", async () => {
  const actual = await vi.importActual<typeof import("@/components")>("@/components");
  return {
    ...actual,
    banner: vi.fn(),
    userPrompt: vi.fn(),
  };
});

const apiModule = await import("@/api");
const { deleteDraft } = apiModule;
const { banner, userPrompt } = await import("@/components");
const itemExistsSpy = vi.spyOn(apiModule, "itemExists");

const setup = async (submission: opensearch.main.Document, id: string) => {
  await renderFormWithPackageSectionAsync(
    <DetailCardWrapper title="Package Actions">
      <PackageActionsCard submission={submission} id={id} />
    </DetailCardWrapper>,
    id,
  );
};

describe("", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    setDefaultStateSubmitter();
    itemExistsSpy.mockResolvedValue(false);
  });

  it("renders nothing if there are no actions", async () => {
    const submission = items[EXISTING_ITEM_ID]?._source as opensearch.main.Document;
    await setup(submission, EXISTING_ITEM_ID);

    expect(screen.getByText("Package Actions")).toBeInTheDocument();
    expect(
      screen.getByText("No actions are currently available for this submission."),
    ).toBeInTheDocument();
  });

  describe("as a state submitter", () => {
    const draftSubmission: opensearch.main.Document = {
      ...TEST_MED_SPA_ITEM._source,
      seatoolStatus: SEATOOL_STATUS.DRAFT,
      stateStatus: "Draft",
      cmsStatus: "Draft",
      event: "new-medicaid-submission",
    };

    it("should show review-draft and delete actions for drafts", async () => {
      await setup(draftSubmission, TEST_MED_SPA_ITEM._id);

      expect(
        await screen.findByRole("link", { name: DRAFT_CONTINUE_ACTION_LABEL }),
      ).toHaveAttribute(
        "href",
        `/new-submission/spa/medicaid/create?draftId=${TEST_MED_SPA_ITEM._id}&origin=spas`,
      );
      expect(screen.getByRole("button", { name: DRAFT_DELETE_ACTION_LABEL })).toBeInTheDocument();
    });

    it("should show review-draft and delete draft actions for locked drafts", async () => {
      itemExistsSpy.mockResolvedValue(true);

      await setup(draftSubmission, TEST_MED_SPA_ITEM._id);

      expect(
        await screen.findByRole("link", { name: DRAFT_CONTINUE_ACTION_LABEL }),
      ).toHaveAttribute(
        "href",
        `/new-submission/spa/medicaid/create?draftId=${TEST_MED_SPA_ITEM._id}&origin=spas`,
      );
      expect(screen.getByRole("button", { name: DRAFT_DELETE_ACTION_LABEL })).toBeInTheDocument();
    });

    it("should open a delete confirmation modal from package details", async () => {
      await setup(draftSubmission, TEST_MED_SPA_ITEM._id);

      screen.getByRole("button", { name: DRAFT_DELETE_ACTION_LABEL }).click();

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
      const nonOwnerDraftSubmission: opensearch.main.Document = {
        ...draftSubmission,
        draft: {
          savedAt: "2026-03-20T00:00:00.000Z",
          originalCreatorEmail: "someoneelse@example.com",
          originalCreatorName: "Someone Else",
          data: {},
        },
      };

      await setup(nonOwnerDraftSubmission, TEST_MED_SPA_ITEM._id);

      screen.getByRole("button", { name: DRAFT_DELETE_ACTION_LABEL }).click();

      expect(userPrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          header: DRAFT_DELETE_MODAL_HEADER,
          body: getNonOwnerDraftDeleteModalBody(TEST_MED_SPA_ITEM._id),
          acceptButtonText: "Delete",
          cancelButtonText: "Cancel",
          cancelVariant: "link",
        }),
      );
    });

    it("should keep users on package details when delete modal is canceled", async () => {
      await setup(draftSubmission, TEST_MED_SPA_ITEM._id);

      screen.getByRole("button", { name: DRAFT_DELETE_ACTION_LABEL }).click();

      const promptData = vi.mocked(userPrompt).mock.calls.at(-1)?.[0];
      expect(promptData).toBeDefined();

      promptData?.onCancel?.();

      expect(deleteDraft).not.toHaveBeenCalled();
      expect(screen.getByText("Package Actions")).toBeInTheDocument();
      expect(screen.queryByText("dashboard test")).not.toBeInTheDocument();
    });

    it("should delete and route users to dashboard from package details", async () => {
      vi.mocked(deleteDraft).mockResolvedValueOnce(undefined);
      await setup(draftSubmission, TEST_MED_SPA_ITEM._id);

      screen.getByRole("button", { name: DRAFT_DELETE_ACTION_LABEL }).click();

      const promptData = vi.mocked(userPrompt).mock.calls.at(-1)?.[0];
      expect(promptData).toBeDefined();

      await promptData?.onAccept?.();

      await waitFor(() => {
        expect(deleteDraft).toHaveBeenCalledWith(TEST_MED_SPA_ITEM._id);
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard?tab=spas", { replace: true });
        expect(banner).toHaveBeenCalledWith(
          expect.objectContaining({
            header: "Draft deleted",
            body: `Draft for ${TEST_MED_SPA_ITEM._id} has been deleted.`,
          }),
        );
      });
    });

    it(`should return actions: [${Action.RESPOND_TO_RAI},${Action.WITHDRAW_PACKAGE}]`, async () => {
      const submission = {
        ...TEST_MED_SPA_ITEM._source,
        seatoolStatus: SEATOOL_STATUS.PENDING_RAI,
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
      };
      mockedServer.use(onceApiPackageActionsHandler(submission as opensearch.main.Document));
      await setup(submission, TEST_MED_SPA_ITEM._id);

      expect(screen.getByText("Package Actions")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: mapActionLabel(Action.RESPOND_TO_RAI) }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: mapActionLabel(Action.WITHDRAW_PACKAGE) }),
      ).toBeInTheDocument();
    });

    it(`should return actions: [${Action.WITHDRAW_PACKAGE}] since it has a duplicate rai`, async () => {
      const submission = {
        ...TEST_MED_SPA_RAI_ITEM._source,
        seatoolStatus: SEATOOL_STATUS.PENDING_RAI,
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
      };
      mockedServer.use(onceApiPackageActionsHandler(submission as opensearch.main.Document));
      await setup(submission, TEST_MED_SPA_RAI_ITEM._id);

      expect(screen.getByText("Package Actions")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: mapActionLabel(Action.WITHDRAW_PACKAGE) }),
      ).toBeInTheDocument();
    });

    it(`should return actions: [${Action.TEMP_EXTENSION}, ${Action.AMEND_WAIVER}]`, async () => {
      const submission = {
        ...TEST_1915B_ITEM._source,
        actionType: "New",
        seatoolStatus: SEATOOL_STATUS.APPROVED,
      };
      mockedServer.use(onceApiPackageActionsHandler(submission as opensearch.main.Document));
      await setup(submission, TEST_1915B_ITEM._id);

      expect(screen.getByText("Package Actions")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: mapActionLabel(Action.TEMP_EXTENSION) }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: mapActionLabel(Action.AMEND_WAIVER) }),
      ).toBeInTheDocument();
    });

    it(`should return actions: [${Action.WITHDRAW_RAI}, ${Action.WITHDRAW_PACKAGE}, ${Action.UPLOAD_SUBSEQUENT_DOCUMENTS}]`, async () => {
      const submission = {
        ...TEST_MED_SPA_ITEM._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
        raiWithdrawEnabled: true,
      };
      mockedServer.use(onceApiPackageActionsHandler(submission as opensearch.main.Document));
      await setup(submission, TEST_MED_SPA_ITEM._id);

      expect(screen.getByText("Package Actions")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: mapActionLabel(Action.WITHDRAW_RAI) }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: mapActionLabel(Action.WITHDRAW_PACKAGE) }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: mapActionLabel(Action.UPLOAD_SUBSEQUENT_DOCUMENTS) }),
      ).toBeInTheDocument();
    });

    it(`should return actions: [${Action.UPLOAD_SUBSEQUENT_DOCUMENTS}, ${Action.WITHDRAW_PACKAGE}]`, async () => {
      const submission = {
        ...TEST_MED_SPA_ITEM._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        actionType: "New",
        raiWithdrawEnabled: true,
      };
      mockedServer.use(onceApiPackageActionsHandler(submission as opensearch.main.Document));
      await setup(submission, TEST_MED_SPA_ITEM._id);

      expect(screen.getByText("Package Actions")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: mapActionLabel(Action.UPLOAD_SUBSEQUENT_DOCUMENTS) }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: mapActionLabel(Action.WITHDRAW_PACKAGE) }),
      ).toBeInTheDocument();
    });
  });

  describe("as a cms reviewer", () => {
    beforeEach(() => {
      setMockUsername(testReviewer);
    });

    it("should not show draft actions for drafts", async () => {
      const submission = {
        ...TEST_MED_SPA_ITEM._source,
        seatoolStatus: SEATOOL_STATUS.DRAFT,
        stateStatus: "Draft",
        cmsStatus: "Draft",
        event: "new-medicaid-submission",
      };

      await setup(submission, TEST_MED_SPA_ITEM._id);

      expect(
        screen.getByText("No actions are currently available for this submission."),
      ).toBeInTheDocument();
    });

    it(`should return actions: [${Action.ENABLE_RAI_WITHDRAW}] for CHIP SPA`, async () => {
      const submission = {
        ...TEST_CHIP_SPA_ITEM._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
      };
      mockedServer.use(onceApiPackageActionsHandler(submission as opensearch.main.Document));
      await setup(submission, TEST_CHIP_SPA_ITEM._id);

      expect(screen.getByText("Package Actions")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: mapActionLabel(Action.ENABLE_RAI_WITHDRAW) }),
      ).toBeInTheDocument();
    });

    it(`should return actions: [${Action.ENABLE_RAI_WITHDRAW}] for Medicaid SPA`, async () => {
      const submission = {
        ...TEST_MED_SPA_ITEM._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
      };
      mockedServer.use(onceApiPackageActionsHandler(submission as opensearch.main.Document));
      await setup(submission, TEST_MED_SPA_ITEM._id);

      expect(screen.getByText("Package Actions")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: mapActionLabel(Action.ENABLE_RAI_WITHDRAW) }),
      ).toBeInTheDocument();
    });

    it(`should return actions: [${Action.DISABLE_RAI_WITHDRAW}] for CHIP SPA`, async () => {
      const submission = {
        ...TEST_CHIP_SPA_ITEM._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
        raiWithdrawEnabled: true,
      };
      mockedServer.use(onceApiPackageActionsHandler(submission as opensearch.main.Document));
      await setup(submission, TEST_CHIP_SPA_ITEM._id);

      expect(screen.getByText("Package Actions")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: mapActionLabel(Action.DISABLE_RAI_WITHDRAW) }),
      ).toBeInTheDocument();
    });

    it(`should return actions: [${Action.DISABLE_RAI_WITHDRAW}] for Medicaid SPA`, async () => {
      const submission = {
        ...TEST_MED_SPA_ITEM._source,
        seatoolStatus: SEATOOL_STATUS.PENDING,
        actionType: "New",
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
        raiReceivedDate: "2024-01-01T00:00:00.000Z",
        raiWithdrawEnabled: true,
      };
      mockedServer.use(onceApiPackageActionsHandler(submission as opensearch.main.Document));
      await setup(submission, TEST_MED_SPA_ITEM._id);

      expect(screen.getByText("Package Actions")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: mapActionLabel(Action.DISABLE_RAI_WITHDRAW) }),
      ).toBeInTheDocument();
    });
  });
});
