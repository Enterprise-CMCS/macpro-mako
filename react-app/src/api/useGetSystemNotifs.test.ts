import * as query from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { API } from "aws-amplify";
import { mockUseGetUser } from "mocks";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

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
    notifId: "futureNotif",
    body: "futureBody",
    header: "Future Header",
    pubDate: "2026-03-14T00:00:00.000Z",
    expDate: "2026-03-20T00:00:00.000Z",
  },
  {
    notifId: "activeNewest",
    body: "newestBody",
    header: "Newest Header",
    pubDate: "2026-03-12T00:00:00.000Z",
    expDate: "2026-03-20T00:00:00.000Z",
  },
  {
    notifId: "activeOldest",
    body: "oldestBody",
    header: "Oldest Header",
    pubDate: "2026-03-10T00:00:00.000Z",
    expDate: "2026-03-20T00:00:00.000Z",
  },
  {
    notifId: "expiredNotif",
    body: "expiredBody",
    header: "Expired Header",
    pubDate: "2026-03-01T00:00:00.000Z",
    expDate: "2026-03-12T00:00:00.000Z",
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

  afterEach(() => {
    vi.useRealTimers();
  });

  test("API call", async () => {
    const apiGetSpy = vi.spyOn(API, "get").mockResolvedValueOnce([
      {
        notifId: "apiNotif",
        body: "apiBody",
        header: "API Header",
        pubDate: "2026-03-10T00:00:00.000Z",
        expDate: "2026-03-20T00:00:00.000Z",
      },
      {
        header: "invalid notification",
      },
    ]);

    const notifs = await api.getSystemNotifs();

    expect(notifs).toBeTruthy();
    expect(notifs.length).toEqual(1);
    expect(notifs[0].notifId).toEqual("apiNotif");

    apiGetSpy.mockRestore();
  });

  test("returns test notification array", () => {
    const {
      result: { current: testHook },
    } = renderHook(() => api.useGetSystemNotifs());

    expect(testHook.allNotifications.map((notif) => notif.notifId)).toEqual([
      "futureNotif",
      "activeNewest",
      "activeOldest",
      "expiredNotif",
    ]);
    expect(testHook.dismissed).toStrictEqual([]);
  });

  test("returns only active notifications sorted by newest pubDate first", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-13T00:00:00.000Z"));

    const {
      result: { current: testHook },
    } = renderHook(() => api.useGetSystemNotifs());

    expect(testHook.notifications.map((notif) => notif.notifId)).toEqual([
      "activeNewest",
      "activeOldest",
    ]);
  });

  test("returns and empty array if there is an error", async () => {
    const apiGetSpy = vi.spyOn(API, "get").mockRejectedValueOnce(new Error("boom"));
    const notifs = await api.getSystemNotifs();
    expect(notifs).toEqual([]);

    apiGetSpy.mockRestore();
  });

  test("falls back to an empty dismissed list when local storage is missing", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => null);

    const {
      result: { current: testHook },
    } = renderHook(() => api.useGetSystemNotifs());

    expect(testHook.dismissed).toStrictEqual([]);
    expect(testHook.notifications.map((notif) => notif.notifId)).toEqual([
      "activeNewest",
      "activeOldest",
    ]);
  });
});
