import { describe, expect, it, vi } from "vitest";
import { PackageDetails } from ".";
import { WITHDRAW_APPK_ITEM_ID, mockUseGetUser } from "mocks";
import * as api from "@/api/useGetUser";
import * as gi from "@/api/useGetItem";
import { WITHDRAW_APPK_ITEM } from "mocks";
import { UseQueryResult } from "@tanstack/react-query";
import { OneMacUser } from "@/api/useGetUser";
import { renderWithQueryClient } from "@/utils/test-helpers/renderForm";
import { getItem } from "@/api";
describe("package details", () => {
  vi.spyOn(gi, "useGetItemCache").mockReturnValue({
    data: WITHDRAW_APPK_ITEM._source,
    refetch: vi.fn(),
  });
  const renderComponent = async () => {
    const item = await getItem(WITHDRAW_APPK_ITEM_ID);
    console.log(item);
    return renderWithQueryClient(<PackageDetails itemResult={item} />);
  };

  it("makes a package", async () => {
    vi.spyOn(api, "useGetUser").mockImplementation(() => {
      const response = mockUseGetUser();
      response.data.isCms = true;
      return response as UseQueryResult<OneMacUser, unknown>;
    });

    const compo = await renderComponent();
    expect(compo).toMatchSnapshot();
  });
});
