import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import {
  EXISTING_ITEM_APPROVED_AMEND_ID,
  EXISTING_ITEM_TEMPORARY_EXTENSION_ID,
  setMockUsername,
  TEST_1915B_ITEM,
  TEST_1915C_ITEM,
  TEST_REVIEWER_USERNAME,
  TEST_STATE_SUBMITTER_USERNAME,
} from "mocks";
import items from "mocks/data/items";
import { opensearch } from "shared-types";
import { beforeEach, describe, expect, it, test, vi } from "vitest";

import * as gaUtils from "@/utils";
import { renderWithQueryClient } from "@/utils/test-helpers";

import { PackageDetails } from ".";
const sendGAEventSpy = vi.spyOn(gaUtils, "sendGAEvent");

const TEST_1915C_APPK_ITEM = items[EXISTING_ITEM_APPROVED_AMEND_ID] as opensearch.main.ItemResult;
const TEST_TEMPORARY_EXTENSION_ITEM = items[
  EXISTING_ITEM_TEMPORARY_EXTENSION_ID
] as opensearch.main.ItemResult;

const setup = async (submission: opensearch.main.Document) => {
  const rendered = renderWithQueryClient(<PackageDetails submission={submission} />);
  if (screen.queryAllByLabelText("three-dots-loading")?.length > 0) {
    await waitForElementToBeRemoved(() => screen.queryAllByLabelText("three-dots-loading"));
  }
  return rendered;
};

describe("package details", () => {
  describe.each([
    ["State Submitter", "statesubmitter", TEST_STATE_SUBMITTER_USERNAME],
    ["CMS Reviewer", "cmsreviewer", TEST_REVIEWER_USERNAME],
  ])("as %s", (title, role, user) => {
    beforeEach(() => {
      setMockUsername(user);
      sendGAEventSpy.mockClear();
      window.gtag = vi.fn();
    });

    it("should send a GA event on load", async () => {
      await setup(TEST_1915B_ITEM._source);

      expect(sendGAEventSpy).toHaveBeenCalledWith("package_details_view", {
        package_id: TEST_1915B_ITEM._source.id,
        package_type: TEST_1915B_ITEM._source.authority,
        state: TEST_1915B_ITEM._source.state,
        user_role: role,
      });

      expect(screen.getByText("1915(b) Package Details")).toBeInTheDocument();
    });

    test.each([
      ["1915(b)", "1915(b) Package Details", TEST_1915B_ITEM._source],
      ["1915(c)", "1915(c) Package Details", TEST_1915C_ITEM._source],
      [
        "1915(c) Appendix K Amendment",
        "1915(c) Appendix K Amendment Package Details",
        TEST_1915C_APPK_ITEM._source,
      ],
      [
        "Temporary Extension Request",
        "Temporary Extension Request Details",
        TEST_TEMPORARY_EXTENSION_ITEM._source,
      ],
    ])("renders package details for a %s", async (title, header, item) => {
      const { asFragment } = await setup(item);
      expect(screen.getByText(header)).toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
