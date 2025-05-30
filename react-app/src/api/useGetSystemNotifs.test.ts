import * as query from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { errorApiNotificationHandler, mockUseGetUser } from "mocks";
import { mockedApiServer as mockedServer } from "mocks/server";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

import * as api from "@/api";

import { OneMacUser } from ".";

vi.mock("@/api/useGetUser", () => ({
  useGetUser: vi.fn(),
}));

vi.mock("@tanstack/react-query", async (imp) => ({
  ...(await imp()),
  useQuery: vi.fn(),
}));

const testNotifs = [
  {
    notifId: "testId",
    body: "testBody",
    header: "testHeader",
    pubDate: new Date().toISOString(),
  },
];

describe("useGetSystemNotif", () => {
  beforeAll(() => {
    vi.spyOn(api, "useGetUser").mockImplementation(() => {
      const response = mockUseGetUser();
      return response as query.UseQueryResult<OneMacUser, unknown>;
    });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => "[]");
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => undefined);
    vi.spyOn(query, "useQuery").mockImplementation(
      () =>
        ({
          data: testNotifs,
        }) as query.UseQueryResult<unknown, unknown>,
    );
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  test("API call", async () => {
    const notifs = await api.getSystemNotifs();
    expect(notifs).toBeTruthy();
    expect(notifs.length).toEqual(1);
  });

  test("returns test notification array", () => {
    // const testHook = api.useGetSystemNotifs();
    const {
      result: { current: testHook },
    } = renderHook(() => api.useGetSystemNotifs());

    // expect(testHook.notifications[0].notifId).toBe(testNotifs[0].notifId);
    expect(testHook.allNotifications[0].notifId).toBe(testNotifs[0].notifId);
    expect(testHook.dismissed).toStrictEqual([]);
  });

  test("returns and empty array if there is an error", async () => {
    mockedServer.use(errorApiNotificationHandler);
    const notifs = await api.getSystemNotifs();
    expect(notifs).toEqual([]);
  });
});
