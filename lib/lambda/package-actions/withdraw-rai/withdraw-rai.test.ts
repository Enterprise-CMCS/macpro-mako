import { withdrawRai } from "./withdraw-rai";
import { vi, describe, it, expect } from "vitest";
import { events } from "shared-types/events";
import { generateMock } from "@anatine/zod-mock";
import * as packageActionWriteService from "../services/package-action-write-service";

vi.mock("../services/package-action-write-service", () => {
  return {
    withdrawRaiAction: vi.fn(),
  };
});

describe("withdrawRai", async () => {
  it("should return a 400 missing candidate when a requestedDate is missing", async () => {
    const response = await withdrawRai(
      { hello: "world" },
      {
        raiRequestedDate: null,
        raiReceivedDate: "asdf",
      },
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
    );
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toBe("Event validation error");
  });

  it("should return a 400 when a bad requestDate is sent", async () => {
    const goodDate = new Date().toISOString();
    const mockData = generateMock(events["withdraw-rai"].baseSchema);
    const response = await withdrawRai(mockData, {
      raiRequestedDate: "123456789",
      raiReceivedDate: goodDate,
    });
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toBe("Event validation error");
  });

  it.skip("should return a 400 when a bad receivedDate is sent", async () => {
    const goodDate = new Date().toISOString();
    const mockData = generateMock(events["withdraw-rai"].baseSchema);
    const response = await withdrawRai(mockData, {
      raiRequestedDate: goodDate,
      raiReceivedDate: "123456789",
    });
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toBe("Event validation error");
  });

  // raiRequestedDate no longer being sent in payload
  it("should return a 200 when a good payload is sent", async () => {
    const goodDate = new Date().toISOString();
    const packageWriteSpy = vi.spyOn(
      packageActionWriteService,
      "withdrawRaiAction",
    );
    const mockData = generateMock(events["withdraw-rai"].baseSchema);
    const response = await withdrawRai(mockData, {
      raiRequestedDate: goodDate,
      raiReceivedDate: goodDate,
    });
    expect(packageWriteSpy).toHaveBeenCalledOnce();
    expect(response.statusCode).toBe(200);
  });
});
