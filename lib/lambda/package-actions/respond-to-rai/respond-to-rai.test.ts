import { respondToRai } from "./respond-to-rai";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { raiResponseSchema } from "shared-types";
import { generateMock } from "@anatine/zod-mock";
import * as packageActionWriteService from "../services/package-action-write-service";

vi.mock("../services/package-action-write-service", () => {
  return {
    respondToRaiAction: vi.fn(),
  };
});

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
    );
    expect(response.statusCode).toBe(400);
  });

  it("should return a 400 when no requested date is sent", async () => {
    const mockData = generateMock(raiResponseSchema);
    const response = await respondToRai(mockData, {
      raiRequestedDate: null,
      raiReceivedDate: null,
      raiWithdrawnDate: null,
    });
    expect(response.statusCode).toBe(400);
  });

  it("should return a 400 when a bad requestDate is sent", async () => {
    const mockData = generateMock(raiResponseSchema);
    const response = await respondToRai(mockData, {
      raiRequestedDate: "123456789", // should be an isoString
      raiReceivedDate: null,
      raiWithdrawnDate: null,
    });
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toBe("Event validation error");
  });

  it("should return a 200 when a good payload is sent", async () => {
    const packageWriteSpy = vi.spyOn(
      packageActionWriteService,
      "respondToRaiAction",
    );
    const mockData = generateMock(raiResponseSchema);
    const response = await respondToRai(mockData, {
      raiRequestedDate: new Date().toISOString(),
      raiReceivedDate: null,
      raiWithdrawnDate: null,
    });
    expect(packageWriteSpy).toHaveBeenCalledOnce();
    expect(response.statusCode).toBe(200);
  });
});
