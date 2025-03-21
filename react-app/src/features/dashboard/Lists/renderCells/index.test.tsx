import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  TEST_1915B_ITEM,
  TEST_1915C_ITEM,
  TEST_CHIP_SPA_ITEM,
  TEST_CMS_REVIEWER_USER,
  TEST_MED_SPA_ITEM,
  TEST_STATE_SUBMITTER_USER,
} from "mocks";
import { Action, CognitoUserAttributes, opensearch, SEATOOL_STATUS } from "shared-types";
import { describe, expect, it } from "vitest";

import { renderWithMemoryRouter } from "@/utils/test-helpers";

import { CellDetailsLink, renderCellActions, renderCellDate } from "./index";

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
        <CellDetailsLink id={item.id} authority={item.authority} />,
        [
          {
            path: "/test",
            element: <CellDetailsLink id={item.id} authority={item.authority} />,
          },
        ],
        {
          initialEntries: ["/test"],
        },
      );
    };
    it("should return a link for cell details for a Medicaid SPA item", () => {
      setup(TEST_MED_SPA_ITEM._source);
      expect(screen.getByText(TEST_MED_SPA_ITEM._id).getAttribute("href")).toEqual(
        `/details/${encodeURIComponent(TEST_MED_SPA_ITEM._source.authority)}/${encodeURIComponent(TEST_MED_SPA_ITEM._id)}`,
      );
    });
    it("should return a link for cell details for a CHIP SPA item", () => {
      setup(TEST_CHIP_SPA_ITEM._source);
      expect(screen.getByText(TEST_CHIP_SPA_ITEM._id).getAttribute("href")).toEqual(
        `/details/${encodeURIComponent(TEST_CHIP_SPA_ITEM._source.authority)}/${encodeURIComponent(TEST_CHIP_SPA_ITEM._id)}`,
      );
    });
    it("should return a link for cell details for a 1915(c) waiver item", () => {
      setup(TEST_1915B_ITEM._source);
      expect(screen.getByText(TEST_1915B_ITEM._id).getAttribute("href")).toEqual(
        `/details/${encodeURIComponent(TEST_1915B_ITEM._source.authority)}/${encodeURIComponent(TEST_1915B_ITEM._id)}`,
      );
    });
    it("should return a link for cell details for a 1915(c) waiver item", () => {
      setup(TEST_1915C_ITEM._source);
      expect(screen.getByText(TEST_1915C_ITEM._id).getAttribute("href")).toEqual(
        `/details/${encodeURIComponent(TEST_1915C_ITEM._source.authority)}/${encodeURIComponent(TEST_1915C_ITEM._id)}`,
      );
    });
  });

  describe("renderCellActions", () => {
    const setup = (
      userAttributes: CognitoUserAttributes | null,
      item: opensearch.main.Document,
    ) => {
      const user = userEvent.setup();
      const element = renderCellActions(userAttributes)(item);
      const rendered = renderWithMemoryRouter(
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
      setup(TEST_STATE_SUBMITTER_USER, TEST_MED_SPA_ITEM._source);
      expect(screen.queryByLabelText("Available actions")).toBeInTheDocument();
    });

    it("should return null if there is no user", () => {
      const { container } = setup(null, TEST_CHIP_SPA_ITEM._source);
      expect(container.childElementCount).toEqual(1);
      expect(container.firstElementChild.childElementCount).toEqual(0);
    });

    describe("as a State Submitter", () => {
      it(`should handle button click and display [${Action.RESPOND_TO_RAI},${Action.WITHDRAW_PACKAGE}]`, async () => {
        const { user } = setup(TEST_STATE_SUBMITTER_USER, {
          ...TEST_MED_SPA_ITEM._source,
          seatoolStatus: SEATOOL_STATUS.PENDING_RAI,
          raiRequestedDate: "2024-01-01T00:00:00.000Z",
        });
        await user.click(screen.getByLabelText("Available actions"));

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
        const { user } = setup(TEST_STATE_SUBMITTER_USER, {
          ...TEST_1915B_ITEM._source,
          actionType: "New",
          seatoolStatus: SEATOOL_STATUS.APPROVED,
        });
        await user.click(screen.getByLabelText("Available actions"));

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
        const { user } = setup(TEST_STATE_SUBMITTER_USER, {
          ...TEST_MED_SPA_ITEM._source,
          seatoolStatus: SEATOOL_STATUS.PENDING,
          actionType: "New",
          raiRequestedDate: "2024-01-01T00:00:00.000Z",
          raiReceivedDate: "2024-01-01T00:00:00.000Z",
          raiWithdrawEnabled: true,
        });
        await user.click(screen.getByLabelText("Available actions"));

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
        const { user } = setup(TEST_STATE_SUBMITTER_USER, {
          ...TEST_MED_SPA_ITEM._source,
          seatoolStatus: SEATOOL_STATUS.PENDING,
          actionType: "New",
          raiWithdrawEnabled: true,
        });
        await user.click(screen.getByLabelText("Available actions"));

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
        const { user } = setup(TEST_CMS_REVIEWER_USER, {
          ...TEST_CHIP_SPA_ITEM._source,
          seatoolStatus: SEATOOL_STATUS.PENDING,
          actionType: "New",
          raiRequestedDate: "2024-01-01T00:00:00.000Z",
          raiReceivedDate: "2024-01-01T00:00:00.000Z",
        });
        await user.click(screen.getByLabelText("Available actions"));

        expect(screen.queryByText("Enable Formal RAI Response Withdraw")).toBeInTheDocument();
        expect(
          screen.getByText("Enable Formal RAI Response Withdraw").getAttribute("href"),
        ).toEqual(getUrl(Action.ENABLE_RAI_WITHDRAW, TEST_CHIP_SPA_ITEM._source));
      });

      it(`should handle a button click and display [${Action.DISABLE_RAI_WITHDRAW}]`, async () => {
        const { user } = setup(TEST_CMS_REVIEWER_USER, {
          ...TEST_MED_SPA_ITEM._source,
          seatoolStatus: SEATOOL_STATUS.PENDING,
          actionType: "New",
          raiRequestedDate: "2024-01-01T00:00:00.000Z",
          raiReceivedDate: "2024-01-01T00:00:00.000Z",
          raiWithdrawEnabled: true,
        });
        await user.click(screen.getByLabelText("Available actions"));

        expect(screen.queryByText("Disable Formal RAI Response Withdraw")).toBeInTheDocument();
        expect(
          screen.getByText("Disable Formal RAI Response Withdraw").getAttribute("href"),
        ).toEqual(getUrl(Action.DISABLE_RAI_WITHDRAW, TEST_MED_SPA_ITEM._source));
      });
    });
  });
});
