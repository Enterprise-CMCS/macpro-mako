import { UseQueryResult } from "@tanstack/react-query";
import { mockUseGetUser } from "mocks";
import * as api from "@/api";
import { beforeAll, afterAll, test, expect, vi, describe } from "vitest";
import { OneMacUser } from ".";

describe("useGetSystemNotif", () => {
  beforeAll(() => {
    vi.spyOn(api, "useGetUser").mockImplementation(() => {
      const response = mockUseGetUser();
      return response as UseQueryResult<OneMacUser, unknown>;
    });
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  test("API call", async () => {
    const notifs = await api.getSystemNotifs();
    expect(notifs).toBeTruthy();
  });

  test("returns test notification array", () => {});
});
