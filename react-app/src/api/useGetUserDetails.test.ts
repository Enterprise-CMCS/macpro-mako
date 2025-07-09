import { errorApiUserDetailsHandler } from "mocks";
import { mockedApiServer as mockedServer } from "mocks/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/utils/ReactGA/SendGAEvent", () => ({
  sendGAEvent: vi.fn(),
}));
import * as gaModule from "@/utils/ReactGA/SendGAEvent";

import { getUserDetails } from "./useGetUserDetails";

describe("getUserDetails tests", () => {
  it("should return user details on success", async () => {
    const user = await getUserDetails();
    expect(user).toEqual({
      id: expect.any(String),
      email: expect.any(String),
      fullName: expect.any(String),
      role: expect.any(String),
      eventType: expect.any(String),
      states: expect.any(Array),
    });
  });

  it("should send GA event and return null on API error", async () => {
    mockedServer.use(errorApiUserDetailsHandler);

    const user = await getUserDetails();
    expect(user).toBeNull();

    expect(gaModule.sendGAEvent).toHaveBeenCalledWith(
      "api_error",
      expect.objectContaining({
        message: "failure /getUserDetails",
      }),
    );
  });
});
