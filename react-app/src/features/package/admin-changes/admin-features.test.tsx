import { AdminChanges } from ".";
import * as api from "@/api/useGetUser";
import { WITHDRAW_APPK_ITEM, ADMIN_CHANGE_ITEM, mockUseGetUser } from "mocks";
import { OneMacUser } from "@/api/useGetUser";
import { renderWithQueryClient } from "@/utils/test-helpers";
import { UseQueryResult } from "@tanstack/react-query";
import { describe, it, expect, vi } from "vitest";
import * as gi from "@/api/useGetItem";
import { UTCDate } from "@date-fns/utc";
describe("Admin Features test", () => {
  vi.spyOn(gi, "useGetItemCache").mockReturnValue({
    data: WITHDRAW_APPK_ITEM._source,
    refetch: vi.fn(),
  });
  //we need to mock the date here because GITHUB likes to switch date to UTC and our form does not use it
  const mockDate = new UTCDate(1672531200000);
  vi.spyOn(global, "Date").mockImplementation(() => mockDate);
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
