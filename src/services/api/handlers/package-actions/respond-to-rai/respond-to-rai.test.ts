import { respondToRai } from "./respond-to-rai";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { MockPackageActionWriteService } from "../services/package-action-write-service";
import { Action, raiResponseSchema } from "shared-types";
import { generateMock } from "@anatine/zod-mock";
import { ExtendedItemResult } from "../../../libs/package";
const mockPackageWrite = new MockPackageActionWriteService();

describe("respondToRai", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a server error response if given bad body", async () => {
    const response = await respondToRai(
      { hello: "world" },
      {
        raiRequestedDate: "999",
        raiReceivedDate: "999",
        raiWithdrawnDate: "999",
      },
      mockPackageWrite,
    );
    expect(response.statusCode).toBe(400);
  });

  it("should return a 400 when no requested date is sent", async () => {
    const mockData = generateMock(raiResponseSchema);
    const response = await respondToRai(
      mockData,
      {
        raiRequestedDate: null,
        raiReceivedDate: null,
        raiWithdrawnDate: null,
      },
      mockPackageWrite,
    );
    expect(response.statusCode).toBe(400);
  });

  it("should return a 400 when a bad requestDate is sent", async () => {
    const mockData = generateMock(raiResponseSchema);
    const response = await respondToRai(
      mockData,
      {
        raiRequestedDate: "123456789", // should be an isoString
        raiReceivedDate: null,
        raiWithdrawnDate: null,
      },
      mockPackageWrite,
    );
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toBe("Event validation error");
  });

  it("should return a 200 when a good payload is sent", async () => {
    const packageWriteSpy = vi.spyOn(mockPackageWrite, "respondToRai");
    const mockData = generateMock(raiResponseSchema);
    const response = await respondToRai(
      mockData,
      {
        raiRequestedDate: new Date().toISOString(),
        raiReceivedDate: null,
        raiWithdrawnDate: null,
      },
      mockPackageWrite,
    );
    expect(packageWriteSpy).toHaveBeenCalledOnce();
    expect(response.statusCode).toBe(200);
  });

  // it("calls package write service with action set to Enable RAI when toggle set to true", async () => {
  //   const packageWriteSpy = vi.spyOn(
  //     mockPackageWrite,
  //     "toggleRaiResponseWithdraw",
  //   );
  //   const mockData = generateMock(toggleWithdrawRaiEnabledSchema);
  //   await toggleRaiResponseWithdraw(mockData, true, mockPackageWrite);

  //   expect(packageWriteSpy).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       action: Action.ENABLE_RAI_WITHDRAW,
  //     }),
  //   );
  // });

  // it("calls package write service with action set to Disable RAI when toggle set to false", async () => {
  //   const packageWriteSpy = vi.spyOn(
  //     mockPackageWrite,
  //     "toggleRaiResponseWithdraw",
  //   );
  //   const mockData = generateMock(toggleWithdrawRaiEnabledSchema);
  //   await toggleRaiResponseWithdraw(mockData, false, mockPackageWrite);

  //   expect(packageWriteSpy).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       action: Action.DISABLE_RAI_WITHDRAW,
  //     }),
  //   );
  // });
});
