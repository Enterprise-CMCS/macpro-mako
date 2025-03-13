import { UseQueryResult } from "@tanstack/react-query";
import { ADMIN_CHANGE_ITEM, mockUseGetUser, WITHDRAW_APPK_ITEM } from "mocks";
import { describe, expect, it, vi } from "vitest";

import { AdminPackageActivities } from ".";

import * as api from "@/api/useGetUser";
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
