import { UseQueryResult } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import { ADMIN_CHANGE_ITEM, mockUseGetUser, WITHDRAW_APPK_ITEM } from "mocks";
import { ItemResult } from "shared-types/opensearch/changelog";
import { describe, expect, it, vi } from "vitest";

import * as api from "@/api/useGetUser";
import { OneMacUser } from "@/api/useGetUser";
import { renderWithQueryClient } from "@/utils/test-helpers";

import { AdminPackageActivities } from ".";

describe("Admin Features test", () => {
  vi.spyOn(api, "useGetUser").mockImplementation(() => {
    const response = mockUseGetUser();
    response.data.isCms = false;
    return response as UseQueryResult<OneMacUser, unknown>;
  });

  it("finds no admin changes", () => {
    renderWithQueryClient(
      <AdminPackageActivities changelog={WITHDRAW_APPK_ITEM._source.changelog} />,
    );

    expect(screen.queryByText(/Administrative Package Changes/)).not.toBeInTheDocument();
  });

  it("finds an admin change admin changes", () => {
    renderWithQueryClient(
      <AdminPackageActivities changelog={ADMIN_CHANGE_ITEM._source.changelog} />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Administrative Package Changes (9)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Administrative changes reflect updates to specific data fields. If you have additional questions, please contact the assigned CPOC.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /Package Added\s*-\s*Sun, Jan 1 2023, 09:00:00 AM EST/,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Change Made" })).toBeInTheDocument();
    expect(screen.getByText("add file")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Change Reason" })).toBeInTheDocument();
    expect(screen.getByText("missing file")).toBeInTheDocument();
    expect(screen.getAllByText(/Enable Formal RAI Response Withdraw/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Disable Formal RAI Response Withdraw/).length).toBeGreaterThan(0);
  });

  it("displays duplicate manual updates only once", () => {
    const duplicateManualUpdates = [
      {
        _id: "DE-0001.R02.00-legacy-admin-change-1748535284333",
        _index: "productionchangelog",
        _source: {
          id: "DE-0001.R02.00-legacy-admin-change-1748535284333",
          packageId: "DE-0001.R02.00",
          timestamp: 1748535284333,
          actionType: "legacy-admin-change" as const,
          changeMade: "Submission Inactivated",
          changeReason: "UPDATED - Per request OY2-35011 to ensure data consistency",
          isAdminChange: true,
          event: "legacy-admin-change" as const,
        },
      },
      {
        _id: "DE-0001.R02.00-1748535284333",
        _index: "productionchangelog",
        _source: {
          id: "DE-0001.R02.00-1748535284333",
          packageId: "DE-0001.R02.00",
          timestamp: 1748535284333,
          actionType: "legacy-admin-change" as const,
          changeMade: "Submission Inactivated",
          changeReason: "UPDATED - Per request OY2-35011 to ensure data consistency",
          isAdminChange: true,
          event: "legacy-admin-change" as const,
        },
      },
    ] as ItemResult[];

    renderWithQueryClient(<AdminPackageActivities changelog={duplicateManualUpdates} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Administrative Package Changes (1)" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Manual Update/ })).toHaveLength(1);
    expect(screen.getAllByText("Submission Inactivated")).toHaveLength(1);
  });
});
