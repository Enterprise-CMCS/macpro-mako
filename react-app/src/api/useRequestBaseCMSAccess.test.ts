import {
  automatedHelpDeskUser,
  automatedReviewer,
  coStateSubmitter,
  errorApiRequestBaseCMSAccessHandler,
  setMockUsername,
} from "mocks";
import { mockedApiServer as mockedServer } from "mocks/server";
import { describe, expect, it, vi } from "vitest";

import * as gaModule from "@/utils/ReactGA/SendGAEvent";

import { requestBaseCMSAccess } from "./useRequestBaseCMSAccess";
vi.mock("@/utils/ReactGA/SendGAEvent", () => ({
  sendGAEvent: vi.fn(),
}));
describe("useRequestBaseCMSAccess", () => {
  it("should return null if the user is not logged in", async () => {
    setMockUsername(null);
    const result = await requestBaseCMSAccess();
    expect(result).toBeNull();
  });

  it("should return null if there is an error", async () => {
    mockedServer.use(errorApiRequestBaseCMSAccessHandler);
    const result = await requestBaseCMSAccess();
    expect(result).toBeNull();
    expect(gaModule.sendGAEvent).toHaveBeenCalledWith(
      "api_error",
      expect.objectContaining({
        message: "failure /requestBaseCMSAccess",
      }),
    );
  });

  it("should return a success message if the user already has roles", async () => {
    const result = await requestBaseCMSAccess();
    expect(result).toEqual({ message: "User roles already created" });
  });

  it("should return a success message if the CMS user does not have roles", async () => {
    setMockUsername(automatedReviewer);
    const result = await requestBaseCMSAccess();
    expect(result).toEqual({ message: "User role updated, because no default role found" });
  });

  it("should return a success message if the CMS help desk user does not have roles", async () => {
    setMockUsername(automatedHelpDeskUser);
    const result = await requestBaseCMSAccess();
    expect(result).toEqual({ message: "User role updated, because no default role found" });
  });

  it("should return a success message if the state user does not have roles", async () => {
    setMockUsername(coStateSubmitter);
    const result = await requestBaseCMSAccess();
    expect(result).toEqual({ message: "User role not updated" });
  });
});
