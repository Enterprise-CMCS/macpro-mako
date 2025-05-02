import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import {
  EXISTING_ITEM_APPROVED_AMEND_ID,
  EXISTING_ITEM_TEMPORARY_EXTENSION_ID,
  TEST_1915B_ITEM,
  TEST_1915C_ITEM,
} from "mocks";
import items from "mocks/data/items";
import { opensearch } from "shared-types";
import { describe, expect, it } from "vitest";

import { renderWithQueryClient } from "@/utils/test-helpers";

import { PackageDetails } from ".";

describe("package details", () => {
  const setup = async (submission: opensearch.main.Document) => {
    const rendered = renderWithQueryClient(<PackageDetails submission={submission} />);
    if (screen.queryAllByLabelText("three-dots-loading")?.length > 0) {
      await waitForElementToBeRemoved(() => screen.queryAllByLabelText("three-dots-loading"));
    }
    return rendered;
  };

  it("renders package details for a 1915(b) submission", async () => {
    const { asFragment } = await setup(TEST_1915B_ITEM._source);
    expect(screen.getByText("1915(b) Package Details")).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it("render package details for a 1915(c) submission", async () => {
    const { asFragment } = await setup(TEST_1915C_ITEM._source);
    expect(screen.getByText("1915(c) Package Details")).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it("render package details for a 1915(c) submission with action type amend", async () => {
    const item = items[EXISTING_ITEM_APPROVED_AMEND_ID] as opensearch.main.ItemResult;
    const { asFragment } = await setup(item._source);
    expect(screen.getByText("1915(c) Appendix K Amendment Package Details")).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it("render package details for a 1915(c) submission with action type extend", async () => {
    const item = items[EXISTING_ITEM_TEMPORARY_EXTENSION_ID] as opensearch.main.ItemResult;
    const { asFragment } = await setup(item._source);
    expect(screen.getByText("Temporary Extension Request Details")).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });
});
