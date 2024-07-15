import { toggleRaiResponseWithdraw } from "./toggle-rai-response-withdraw";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { MockPackageActionWriteService } from "../services/package-action-write-service";
import { toggleWithdrawRaiEnabledSchema } from "shared-types";
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

  it("should pass validation and call class method", async () => {
    const mockData = generateMock(toggleWithdrawRaiEnabledSchema);
    const toggleRaiWithdraw = await toggleRaiResponseWithdraw(
      mockData,
      true,
      mockPackageWrite,
    );
    expect(toggleRaiWithdraw.statusCode).toBe(200);
  });
});
