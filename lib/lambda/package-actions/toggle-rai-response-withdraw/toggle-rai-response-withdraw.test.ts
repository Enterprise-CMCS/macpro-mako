import { toggleRaiResponseWithdraw } from "./toggle-rai-response-withdraw";
import { vi, describe, it, expect } from "vitest";
import { Action, toggleWithdrawRaiEnabledSchema } from "shared-types";
import { generateMock } from "@anatine/zod-mock";
import * as packageActionWriteService from "../services/package-action-write-service";

vi.mock("../services/package-action-write-service", () => {
  return {
    toggleRaiResponseWithdrawAction: vi.fn(),
  };
});

describe("toggleRaiResponseWithdraw", async () => {
  it("should return a server error response if given bad body", async () => {
    const toggleRaiWithdraw = await toggleRaiResponseWithdraw({
      hello: "world",
    });

    expect(toggleRaiWithdraw.statusCode).toBe(400);
  });

  it("package write is called when valid data is passed and 200 status code is returned", async () => {
    const packageWriteSpy = vi.spyOn(
      packageActionWriteService,
      "toggleRaiResponseWithdrawAction",
    );

    const mockData = generateMock(toggleWithdrawRaiEnabledSchema);
    const toggleRaiWithdraw = await toggleRaiResponseWithdraw(mockData);

    expect(packageWriteSpy).toHaveBeenCalledOnce();
    expect(toggleRaiWithdraw.statusCode).toBe(200);
  });

  it("calls package write service with action set to Enable RAI when toggle set to true", async () => {
    const packageWriteSpy = vi.spyOn(
      packageActionWriteService,
      "toggleRaiResponseWithdrawAction",
    );

    const mockData = generateMock(toggleWithdrawRaiEnabledSchema);
    await toggleRaiResponseWithdraw({ ...mockData, toggle: true });

    expect(packageWriteSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        action: Action.ENABLE_RAI_WITHDRAW,
      }),
    );
  });

  it("calls package write service with action set to Disable RAI when toggle set to false", async () => {
    const mockData = generateMock(toggleWithdrawRaiEnabledSchema);
    await toggleRaiResponseWithdraw(mockData);
  });
});
