import { describe, expect, it, vi } from "vitest";
import { UseQueryResult } from "@tanstack/react-query";

import * as api from "@/api/useGetUser";

import { PackageDetails } from ".";

import { mockUseGetUser, WITHDRAW_APPK_ITEM } from "mocks";
import { renderWithQueryClient } from "@/utils/test-helpers";
import { OneMacUser } from "@/api";

describe("package details", () => {
  it("makes a package", async () => {
    vi.spyOn(api, "useGetUser").mockImplementation(() => {
      const response = mockUseGetUser();

      return response as UseQueryResult<OneMacUser, unknown>;
    });
    const renderComponent = async () => {
      return renderWithQueryClient(<PackageDetails submission={WITHDRAW_APPK_ITEM._source} />);
    };
    const compo = await renderComponent();
    expect(compo).toMatchSnapshot();
  });
});
