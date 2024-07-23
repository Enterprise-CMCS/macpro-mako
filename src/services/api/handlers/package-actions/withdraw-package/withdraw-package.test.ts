import { assert, describe, expect, it, vi } from "vitest";
import { withdrawPackage } from "./withdraw-package";
import { generateMock } from "@anatine/zod-mock";
import { withdrawPackageSchema } from "shared-types";
import * as packageActionWriteService from "../services/package-action-write-service";

vi.mock("../services/package-action-write-service", () => {
  return {
    withdrawPackageAction: vi.fn(),
  };
});

describe("withdrawPackageAction", async () => {
  it("should return a server error response if given bad body", async () => {
    const withdrawPackageAction = await withdrawPackage({
      hello: "world",
    });

    if (withdrawPackageAction === undefined) {
      throw new Error("withdrawPackageAction should be defined");
    }

    expect(withdrawPackageAction.statusCode).toBe(400);
  });

  it("should invoke withdraw package action if given a valid body", async () => {
    const withdrawPackageSpy = vi.spyOn(
      packageActionWriteService,
      "withdrawPackageAction",
    );
    const mockWithdrawPackageBody = generateMock(withdrawPackageSchema);

    await withdrawPackage(mockWithdrawPackageBody);

    expect(withdrawPackageSpy).toHaveBeenCalledOnce();
  });
});
