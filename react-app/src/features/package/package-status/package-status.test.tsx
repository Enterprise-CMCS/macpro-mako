import { describe, expect, it, vi } from "vitest";

import * as api from "@/api/useGetUser";
import { UseQueryResult } from "@tanstack/react-query";
import { PackageStatusCard } from ".";
import { renderWithQueryClient } from "@/utils/test-helpers";
import { mockUseGetUser, TEST_PACKAGE_STATUS_ITEM } from "mocks";
import { OneMacUser } from "@/api";
describe("Package Status test", () => {
  vi.spyOn(api, "useGetUser").mockImplementation(() => {
    const response = mockUseGetUser();
    response.data.isCms = true;
    return response as UseQueryResult<OneMacUser, unknown>;
  });
  it("The package status component is called successfully", async () => {
    const { asFragment } = renderWithQueryClient(
      <PackageStatusCard data={TEST_PACKAGE_STATUS_ITEM} />,
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
