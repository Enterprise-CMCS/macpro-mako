import { UseQueryResult } from "@tanstack/react-query";
import { mockUseGetUser, WITHDRAW_APPK_ITEM, WITHDRAW_APPK_ITEM_ID } from "mocks";
import { describe, expect, it, vi } from "vitest";

import { getItem, OneMacUser } from "@/api";
import * as gi from "@/api/useGetItem";
import * as api from "@/api/useGetUser";
import { renderWithQueryClient } from "@/utils/test-helpers";

import { SubmissionDetails } from ".";

describe("package details", () => {
  vi.spyOn(gi, "useGetItemCache").mockReturnValue({
    data: WITHDRAW_APPK_ITEM._source,
    refetch: vi.fn(),
  });

  it("makes a package", async () => {
    vi.spyOn(api, "useGetUser").mockImplementation(() => {
      const response = mockUseGetUser();
      response.data.isCms = false;
      return response as UseQueryResult<OneMacUser, unknown>;
    });
    const renderComponent = async () => {
      const item = await getItem(WITHDRAW_APPK_ITEM_ID);
      return renderWithQueryClient(<SubmissionDetails itemResult={item} />);
    };
    const compo = await renderComponent();
    expect(compo).toMatchSnapshot();
  });
});
