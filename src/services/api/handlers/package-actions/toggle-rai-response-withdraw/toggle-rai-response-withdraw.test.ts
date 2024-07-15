import { toggleRaiResponseWithdraw } from "./toggle-rai-response-withdraw";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { MockPackageActionWriteService } from "../services/package-action-write-service";
import { Action, toggleWithdrawRaiEnabledSchema } from "shared-types";
import { generateMock } from "@anatine/zod-mock";
const mockPackageWrite = new MockPackageActionWriteService();

describe("toggleRaiResponseWithdraw", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a server error response if given bad body", async () => {
    const toggleRaiWithdraw = await toggleRaiResponseWithdraw(
      { hello: "world" },
      true,
      mockPackageWrite,
    );

    expect(toggleRaiWithdraw.statusCode).toBe(400);
  });

  it("package write is called when valid data is passed and 200 status code is returned", async () => {
    const packageWriteSpy = vi.spyOn(
      mockPackageWrite,
      "toggleRaiResponseWithdraw",
    );
    const mockData = generateMock(toggleWithdrawRaiEnabledSchema);
    const toggleRaiWithdraw = await toggleRaiResponseWithdraw(
      mockData,
      true,
      mockPackageWrite,
    );

    expect(packageWriteSpy).toHaveBeenCalledOnce();
    expect(toggleRaiWithdraw.statusCode).toBe(200);
  });

  it("calls package write service with action set to Enable RAI when toggle set to true", async () => {
    const packageWriteSpy = vi.spyOn(
      mockPackageWrite,
      "toggleRaiResponseWithdraw",
    );
    const mockData = generateMock(toggleWithdrawRaiEnabledSchema);
    await toggleRaiResponseWithdraw(mockData, true, mockPackageWrite);

    expect(packageWriteSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        action: Action.ENABLE_RAI_WITHDRAW,
      }),
    );
  });

  it("calls package write service with action set to Disable RAI when toggle set to false", async () => {
    const packageWriteSpy = vi.spyOn(
      mockPackageWrite,
      "toggleRaiResponseWithdraw",
    );
    const mockData = generateMock(toggleWithdrawRaiEnabledSchema);
    await toggleRaiResponseWithdraw(mockData, false, mockPackageWrite);

    expect(packageWriteSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        action: Action.DISABLE_RAI_WITHDRAW,
      }),
    );
  });
});
