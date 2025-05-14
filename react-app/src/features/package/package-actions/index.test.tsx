import { screen } from "@testing-library/react";
import {
  EXISTING_ITEM_ID,
  makoReviewer,
  onceApiPackageActionsHandler,
  setDefaultStateSubmitter,
  setMockUsername,
  TEST_1915B_ITEM,
  TEST_CHIP_SPA_ITEM,
  TEST_MED_SPA_ITEM,
  TEST_MED_SPA_RAI_ITEM,
} from "mocks";
import items from "mocks/data/items";
import { mockedApiServer as mockedServer } from "mocks/server";
import { Action, opensearch, SEATOOL_STATUS } from "shared-types";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mapActionLabel } from "@/utils";
import { renderFormWithPackageSectionAsync } from "@/utils/test-helpers/renderForm";

import { PackageActionsCard } from "./index";

describe("", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setDefaultStateSubmitter();
  });

  it("renders nothing if there are no actions", async () => {
    const submission = items[EXISTING_ITEM_ID]?._source as opensearch.main.Document;
    await renderFormWithPackageSectionAsync(
      <PackageActionsCard submission={submission} id={EXISTING_ITEM_ID} />,
      EXISTING_ITEM_ID,
    );
    expect(screen.getByText("Package Actions")).toBeInTheDocument();
    expect(
      screen.getByText("No actions are currently available for this submission."),
    ).toBeInTheDocument();
  });

  describe("as a state submitter", () => {
    it(`should return actions: [${Action.RESPOND_TO_RAI},${Action.WITHDRAW_PACKAGE}]`, async () => {
      const submission = {
        ...TEST_MED_SPA_ITEM._source,
        seatoolStatus: SEATOOL_STATUS.PENDING_RAI,
        raiRequestedDate: "2024-01-01T00:00:00.000Z",
      };
      mockedServer.use(onceApiPackageActionsHandler(submission as opensearch.main.Document));
      await renderFormWithPackageSectionAsync(
        <PackageActionsCard submission={submission} id={TEST_MED_SPA_ITEM._id} />,
        TEST_MED_SPA_ITEM._id,
      );
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
      await renderFormWithPackageSectionAsync(
        <PackageActionsCard submission={submission} id={TEST_MED_SPA_RAI_ITEM._id} />,
        TEST_MED_SPA_RAI_ITEM._id,
      );
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
      await renderFormWithPackageSectionAsync(
        <PackageActionsCard submission={submission} id={TEST_1915B_ITEM._id} />,
        TEST_1915B_ITEM._id,
      );
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
      await renderFormWithPackageSectionAsync(
        <PackageActionsCard submission={submission} id={TEST_MED_SPA_ITEM._id} />,
        TEST_MED_SPA_ITEM._id,
      );
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
      await renderFormWithPackageSectionAsync(
        <PackageActionsCard submission={submission} id={TEST_MED_SPA_ITEM._id} />,
        TEST_MED_SPA_ITEM._id,
      );
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
      setMockUsername(makoReviewer);
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
      await renderFormWithPackageSectionAsync(
        <PackageActionsCard submission={submission} id={TEST_CHIP_SPA_ITEM._id} />,
        TEST_CHIP_SPA_ITEM._id,
      );
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
      await renderFormWithPackageSectionAsync(
        <PackageActionsCard submission={submission} id={TEST_MED_SPA_ITEM._id} />,
        TEST_MED_SPA_ITEM._id,
      );
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
      await renderFormWithPackageSectionAsync(
        <PackageActionsCard submission={submission} id={TEST_CHIP_SPA_ITEM._id} />,
        TEST_CHIP_SPA_ITEM._id,
      );
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
      await renderFormWithPackageSectionAsync(
        <PackageActionsCard submission={submission} id={TEST_MED_SPA_ITEM._id} />,
        TEST_MED_SPA_ITEM._id,
      );
      expect(screen.getByText("Package Actions")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: mapActionLabel(Action.DISABLE_RAI_WITHDRAW) }),
      ).toBeInTheDocument();
    });
  });
});
