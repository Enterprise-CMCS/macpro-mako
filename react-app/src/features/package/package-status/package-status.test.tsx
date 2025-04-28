import { UseQueryResult } from "@tanstack/react-query";
import { mockUseGetUser, TEST_PACKAGE_STATUS_ITEM } from "mocks";
import { describe, expect, it, vi } from "vitest";

import { OneMacUser } from "@/api";
import * as api from "@/api/useGetUser";
import { renderWithQueryClient } from "@/utils/test-helpers";

import { PackageStatusCard } from ".";
describe("Package Status test", () => {
  vi.spyOn(api, "useGetUser").mockImplementation(() => {
    const response = mockUseGetUser();
    response.data.user.role = "defaultcmsuser";
    return response as UseQueryResult<OneMacUser, unknown>;
  });
  it("The package status component is called successfully", async () => {
    const { asFragment } = renderWithQueryClient(
      <PackageStatusCard submission={TEST_PACKAGE_STATUS_ITEM._source} />,
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
