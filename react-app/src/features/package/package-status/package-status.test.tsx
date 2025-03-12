import { UseQueryResult } from "@tanstack/react-query";
import { mockUseGetUser, TEST_PACKAGE_STATUS_ITEM } from "mocks";
import { describe, expect, it, vi } from "vitest";

import { PackageStatusCard } from ".";

import { OneMacUser } from "@/api";
import * as api from "@/api/useGetUser";
import { renderWithQueryClient } from "@/utils/test-helpers";

describe("Package Status test", () => {
  vi.spyOn(api, "useGetUser").mockImplementation(() => {
    const response = mockUseGetUser();
    response.data.user["custom:cms-roles"] = "ONEMAC_USER_D";
    return response as UseQueryResult<OneMacUser, unknown>;
  });
  it("The package status component is called successfully", async () => {
    const { asFragment } = renderWithQueryClient(
      <PackageStatusCard submission={TEST_PACKAGE_STATUS_ITEM._source} />,
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
