import { UseQueryResult } from "@tanstack/react-query";
import { mockUseGetUser, WITHDRAW_APPK_ITEM } from "mocks";
import { describe, expect, it, vi } from "vitest";

import { OneMacUser } from "@/api";
import * as api from "@/api/useGetUser";
import { renderWithQueryClient } from "@/utils/test-helpers";

import { PackageDetails } from ".";

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
