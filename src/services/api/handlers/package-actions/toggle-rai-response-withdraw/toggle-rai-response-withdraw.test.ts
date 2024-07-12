import { toggleRaiResponseWithdraw } from "./toggle-rai-response-withdraw";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { MockPackageActionWriteService } from "../services/package-action-write-service";
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
});
