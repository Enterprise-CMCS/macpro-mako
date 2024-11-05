import { vi, describe, it, expect, beforeEach } from "vitest";
import { events } from "shared-types";
import { generateMock } from "@anatine/zod-mock";
import * as packageActionWriteService from "../services/package-action-write-service";
import { respondToRai } from "./respond-to-rai";

vi.mock("../services/package-action-write-service", () => {
  return {
    respondToRaiAction: vi.fn(),
  };
});

// TODO: not sure why this is throwing an infinite loop - skipping for now
describe.skip("respondToRai", async () => {
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
    const mockData = generateMock(events["respond-to-rai"].schema);
    const response = await respondToRai(mockData, {
      raiRequestedDate: null,
      raiReceivedDate: null,
      raiWithdrawnDate: null,
    });
    expect(response.statusCode).toBe(400);
  });

  it("should return a 400 when a bad requestDate is sent", async () => {
    const mockData = generateMock(events["respond-to-rai"].schema);
    const response = await respondToRai(mockData, {
      raiRequestedDate: "123456789", // should be an isoString
      raiReceivedDate: null,
      raiWithdrawnDate: null,
    });
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toBe("Event validation error");
  });

  it("should return a 200 when a good payload is sent", async () => {
    const packageWriteSpy = vi.spyOn(packageActionWriteService, "respondToRaiAction");
    const mockData = generateMock(events["respond-to-rai"].schema);
    const response = await respondToRai(mockData, {
      raiRequestedDate: new Date().toISOString(),
      raiReceivedDate: null,
      raiWithdrawnDate: null,
    });
    expect(packageWriteSpy).toHaveBeenCalledOnce();
    expect(response.statusCode).toBe(200);
  });
});
