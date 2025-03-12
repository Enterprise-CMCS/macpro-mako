import { UseQueryResult } from "@tanstack/react-query";
import { ADMIN_CHANGE_ITEM, mockUseGetUser, WITHDRAW_APPK_ITEM } from "mocks";
import { describe, expect, it, vi } from "vitest";

import * as gi from "@/api/useGetItem";
import * as api from "@/api/useGetUser";
import { OneMacUser } from "@/api/useGetUser";
import { renderWithQueryClient } from "@/utils/test-helpers";

import { AdminChanges } from ".";

describe("Admin Features test", () => {
  vi.spyOn(gi, "useGetItemCache").mockReturnValue({
    data: WITHDRAW_APPK_ITEM._source,
    refetch: vi.fn(),
  });

  vi.spyOn(api, "useGetUser").mockImplementation(() => {
    const response = mockUseGetUser();
    response.data.isCms = false;
    return response as UseQueryResult<OneMacUser, unknown>;
  });
  it("finds no admin changes", () => {
    const admin = renderWithQueryClient(<AdminChanges />);

    expect(admin).toMatchSnapshot();
  });
  it("finds an admin change admin changes", () => {
    vi.spyOn(gi, "useGetItemCache").mockReturnValue({
      data: ADMIN_CHANGE_ITEM._source,
      refetch: vi.fn(),
    });
    const admin = renderWithQueryClient(<AdminChanges />);

    expect(admin).toMatchSnapshot();
  });
});
