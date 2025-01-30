import { describe, expect, it, vi } from "vitest";
import { UseQueryResult } from "@tanstack/react-query";

import * as api from "@/api/useGetUser";
import * as gi from "@/api/useGetItem";

import { PackageDetails } from ".";
import { AppK } from "./appk";

import { mockUseGetUser, WITHDRAW_APPK_ITEM, WITHDRAW_APPK_ITEM_ID } from "mocks";
import { renderWithQueryClient } from "@/utils/test-helpers";
import { getItem, OneMacUser } from "@/api";

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
      return renderWithQueryClient(<PackageDetails itemResult={item} />);
    };
    const compo = await renderComponent();
    expect(compo).toMatchSnapshot();
  });
  it("makes a an appk element", async () => {
    vi.spyOn(api, "useGetUser").mockImplementation(() => {
      const response = mockUseGetUser();
      response.data.isCms = false;
      return response as UseQueryResult<OneMacUser, unknown>;
    });
    const renderComponent = async () => {
      return renderWithQueryClient(<AppK />);
    };
    const compo = await renderComponent();
    expect(compo).toMatchSnapshot();
  });
});
