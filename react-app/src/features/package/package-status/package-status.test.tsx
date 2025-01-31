import { describe, expect, it, vi } from "vitest";
import * as gi from "@/api/useGetItem";
import * as api from "@/api/useGetUser";
import * as useItem from "@/api/useGetItem";
import { UseQueryResult } from "@tanstack/react-query";
import { PackageStatusCard } from ".";
import { renderFormWithPackageSectionAsync } from "@/utils/test-helpers";
import { mockUseGetUser, TEST_PACKAGE_STATUS_ID, TEST_PACKAGE_STATUS_ITEM } from "mocks";
import { OneMacUser } from "@/api";
import { opensearch, ReactQueryApiError } from "shared-types";
describe("Package Status test", () => {
  vi.spyOn(gi, "useGetItemCache").mockReturnValue({
    data: TEST_PACKAGE_STATUS_ITEM._source,
    refetch: vi.fn(),
  });
  vi.spyOn(useItem, "useGetItem").mockImplementation(() => {
    const response = { data: TEST_PACKAGE_STATUS_ITEM, isLoading: false, isSuccess: true };

    return response as UseQueryResult<opensearch.main.ItemResult, ReactQueryApiError>;
  });
  vi.spyOn(api, "useGetUser").mockImplementation(() => {
    const response = mockUseGetUser();
    response.data.isCms = true;
    return response as UseQueryResult<OneMacUser, unknown>;
  });
  it("The package status component is called successfully", async () => {
    const { asFragment } = await renderFormWithPackageSectionAsync(
      <PackageStatusCard id={TEST_PACKAGE_STATUS_ID} />,
      TEST_PACKAGE_STATUS_ID,
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
