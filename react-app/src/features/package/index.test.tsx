import { describe, expect, it, vi } from "vitest";
import { UseQueryResult } from "@tanstack/react-query";

import * as api from "@/api/useGetUser";

import { DetailsContent } from ".";
import { mockUseGetUser, ADMIN_CHANGE_ITEM, ADMIN_ITEM_ID } from "mocks";
import { OneMacUser } from "@/api/useGetUser";
import { renderFormAsync } from "@/utils/test-helpers";
import * as gi from "@/api/useGetItem";
describe("package details", () => {
  vi.spyOn(gi, "useGetItemCache").mockReturnValue({
    data: ADMIN_CHANGE_ITEM._source,
    refetch: vi.fn(),
  });
  it("makes a package", async () => {
    vi.spyOn(api, "useGetUser").mockImplementation(() => {
      const response = mockUseGetUser();
      return response as UseQueryResult<OneMacUser, unknown>;
    });
    const { asFragment } = await renderFormAsync(<DetailsContent id={ADMIN_ITEM_ID} />);
    // const compo = await renderComponent();
    expect(asFragment()).toMatchSnapshot();
  });
});
