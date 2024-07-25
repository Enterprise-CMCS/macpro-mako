import { withdrawRai } from "./withdraw-rai";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { MockPackageActionWriteService } from "../services/package-action-write-service";
import { Action, raiWithdrawSchema } from "shared-types";
import { generateMock } from "@anatine/zod-mock";
import { ExtendedItemResult } from "../../../libs/api/package";
const mockPackageWrite = new MockPackageActionWriteService();

describe("withdrawRai", async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a 400 missing candidate when a requestedDate is missing", async () => {
    const response = await withdrawRai(
      { hello: "world" },
      {
        raiRequestedDate: null,
        raiReceivedDate: "asdf",
      },
      mockPackageWrite,
    );
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toBe(
      "No candidate RAI available",
    );
  });

  it("should return a 400 missing candidate when a receivedDate is missing", async () => {
    const response = await withdrawRai(
      { hello: "world" },
      {
        raiRequestedDate: "999",
        raiReceivedDate: null,
      },
      mockPackageWrite,
    );
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toBe(
      "No candidate RAI available",
    );
  });

  it("should return a server error response if given bad body", async () => {
    const goodDate = new Date().toISOString();
    const response = await withdrawRai(
      { hello: "world" },
      {
        raiRequestedDate: goodDate,
        raiReceivedDate: goodDate,
      },
      mockPackageWrite,
    );
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toBe("Event validation error");
  });

  it("should return a 400 when a bad requestDate is sent", async () => {
    const goodDate = new Date().toISOString();
    const mockData = generateMock(raiWithdrawSchema);
    const response = await withdrawRai(
      mockData,
      {
        raiRequestedDate: "123456789",
        raiReceivedDate: goodDate,
      },
      mockPackageWrite,
    );
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toBe("Event validation error");
  });

  it.skip("should return a 400 when a bad receivedDate is sent", async () => {
    const goodDate = new Date().toISOString();
    const mockData = generateMock(raiWithdrawSchema);
    const response = await withdrawRai(
      mockData,
      {
        raiRequestedDate: goodDate,
        raiReceivedDate: "123456789",
      },
      mockPackageWrite,
    );
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toBe("Event validation error");
  });

  it("should return a 200 when a good payload is sent", async () => {
    const goodDate = new Date().toISOString();
    const packageWriteSpy = vi.spyOn(mockPackageWrite, "withdrawRai");
    const mockData = generateMock(raiWithdrawSchema);
    const response = await withdrawRai(
      mockData,
      {
        raiRequestedDate: goodDate,
        raiReceivedDate: goodDate,
      },
      mockPackageWrite,
    );
    expect(packageWriteSpy).toHaveBeenCalledOnce();
    expect(response.statusCode).toBe(200);
  });
});
