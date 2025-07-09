import {
  coStateSubmitter,
  errorApiGetCreateUserProfileHandler,
  osStateSubmitter,
  setMockUsername,
} from "mocks";
import { mockedApiServer as mockedServer } from "mocks/server";
import { describe, expect, it, vi } from "vitest";

import * as gaModule from "@/utils/ReactGA/SendGAEvent";

import { createUserProfile } from "./useCreateUserProfile";
vi.mock("@/utils/ReactGA/SendGAEvent", () => ({
  sendGAEvent: vi.fn(),
}));
describe("useCreateUserProfile", () => {
  it("should return that the user profile has been created for coStateSubmitter", async () => {
    setMockUsername(coStateSubmitter);
    const result = await createUserProfile();
    expect(result).toEqual({ message: "User profile created" });
  });
  it("should return that the user profile already exists for osStateSubmitter", async () => {
    setMockUsername(osStateSubmitter);
    const result = await createUserProfile();
    expect(result).toEqual({ message: "User profile already exists" });
  });
  it("should return null if there is an error", async () => {
    mockedServer.use(errorApiGetCreateUserProfileHandler);
    const result = await createUserProfile();
    expect(result).toBeNull();
    expect(gaModule.sendGAEvent).toHaveBeenCalledWith(
      "api_error",
      expect.objectContaining({
        message: "failure /createUserProfile",
      }),
    );
  });
});
