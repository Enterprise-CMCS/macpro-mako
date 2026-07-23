import { UseQueryResult } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import { mockUseGetUser, TEST_PACKAGE_STATUS_ITEM } from "mocks";
import { describe, expect, it, vi } from "vitest";

import { OneMacUser } from "@/api";
import * as api from "@/api/useGetUser";
import { renderWithQueryClient } from "@/utils/test-helpers";

import { PackageStatusCard } from ".";

const mockUseFeatureFlag = vi.hoisted(() => vi.fn(() => false));

vi.mock("@/hooks/useFeatureFlag", () => ({
  useFeatureFlag: mockUseFeatureFlag,
}));

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

  it("shows the SMART status without the OneMAC RAI withdraw sub-status when the flag is on", () => {
    mockUseFeatureFlag.mockReturnValue(true);
    const submission = {
      ...TEST_PACKAGE_STATUS_ITEM._source,
      cmsStatus: "Pending",
      raiWithdrawEnabled: true,
    };

    renderWithQueryClient(<PackageStatusCard submission={submission} />);

    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.queryByText("Withdraw Formal RAI Response - Enabled")).not.toBeInTheDocument();
    mockUseFeatureFlag.mockReturnValue(false);
  });
});
