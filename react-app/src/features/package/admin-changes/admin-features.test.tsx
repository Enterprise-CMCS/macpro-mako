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

  it("shows a fallback when a manual update has no change reason", () => {
    const manualUpdate = [
      {
        _id: "MD-26-9000-NK3-A-smart-administrative-1789689591000",
        _index: "mainchangelog",
        _source: {
          id: "MD-26-9000-NK3-A-smart-administrative-1789689591000",
          packageId: "MD-26-9000-NK3-A",
          event: "update-values" as const,
          timestamp: 1789689591000,
          changeMade: "Initial Submission Date changed from 2026-09-16 to 2026-09-15",
          isAdminChange: true,
        },
      },
    ] as ItemResult[];

    renderWithQueryClient(<AdminPackageActivities changelog={manualUpdate} />);

    expect(screen.getByRole("button", { name: /Manual Update/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Change Reason" })).toBeInTheDocument();
    expect(screen.getByText("No information submitted")).toBeInTheDocument();
  });

  it.each([
    { authority: "CHIP SPA", changeType: "Manual Update", label: "Manual Update" },
    { authority: "Medicaid SPA", changeType: undefined, label: "Package Added" },
  ])(
    "renders a SMART $authority split as $label with its reason and timestamp",
    ({ authority, changeType, label }) => {
      const changeMade = "OH-26-1123-A was manually added to OneMAC.";
      const changeReason =
        "This package was added to OneMAC from SMART. Package was split from SPA OH-26-1123 by Example CMS User. Reason: Separate the eligibility provisions";
      const activity = [
        {
          _id: "OH-26-1123-A-smart-split-smart-child",
          _index: "test-changelog",
          _source: {
            id: "OH-26-1123-A-smart-split-smart-child",
            packageId: "OH-26-1123-A",
            authority,
            event: "split-spa",
            changeType,
            operationType: "MSP_SPLIT_SPA_CREATED",
            isAdminChange: true,
            timestamp: Date.parse("2026-11-23T18:00:00.000Z"),
            changeMade,
            changeReason,
          },
        },
      ] as ItemResult[];

      renderWithQueryClient(<AdminPackageActivities changelog={activity} />);

      expect(
        screen.getByRole("button", {
          name: new RegExp(`${label}\\s*-\\s*Mon, Nov 23 2026, 01:00:00 PM EST`),
        }),
      ).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2, name: "Change Made" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2, name: "Change Reason" })).toBeInTheDocument();
      expect(screen.getByText(changeMade)).toBeInTheDocument();
      expect(screen.getByText(changeReason)).toBeInTheDocument();
    },
  );
});
