import { UseQueryResult } from "@tanstack/react-query";
import { describe, it, expect, vi } from "vitest";

import * as api from "@/api/useGetUser";

import { AdminPackageActivities } from ".";
import { WITHDRAW_APPK_ITEM, ADMIN_CHANGE_ITEM, mockUseGetUser } from "mocks";

import { OneMacUser } from "@/api/useGetUser";
import { renderWithQueryClient } from "@/utils/test-helpers";

describe("Admin Features test", () => {
  vi.spyOn(api, "useGetUser").mockImplementation(() => {
    const response = mockUseGetUser();
    response.data.isCms = false;
    return response as UseQueryResult<OneMacUser, unknown>;
  });

  it("finds no admin changes", () => {
    const admin = renderWithQueryClient(
      <AdminPackageActivities changelog={WITHDRAW_APPK_ITEM._source.changelog} />,
    );

    expect(admin).toMatchSnapshot();
  });

  it("finds an admin change admin changes", () => {
    const admin = renderWithQueryClient(
      <AdminPackageActivities changelog={ADMIN_CHANGE_ITEM._source.changelog} />,
    );

    expect(admin).toMatchSnapshot();
  });
});
