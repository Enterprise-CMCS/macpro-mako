import { withdrawRai } from "./withdraw-rai";
import { vi, describe, it, expect } from "vitest";
import { raiWithdrawSchema } from "shared-types";
import { generateMock } from "@anatine/zod-mock";
import * as packageActionWriteService from "../services/package-action-write-service";

vi.mock("../services/package-action-write-service", () => ({
  withdrawRaiAction: vi.fn().mockImplementation((body) => {
    if (body.id === "test-id") {
      return Promise.resolve({
        statusCode: 500,
        body: JSON.stringify({ message: "Internal server error" }),
      });
    }
    if (!body.requestedDate) {
      return Promise.resolve({
        statusCode: 500,
        body: JSON.stringify({ message: "Internal server error" }),
      });
    }
    if (typeof body.requestedDate !== "string") {
      return Promise.resolve({
        statusCode: 500,
        body: JSON.stringify({ message: "Internal server error" }),
      });
    }
    if (!body.receivedDate) {
      return Promise.resolve({
        statusCode: 500,
        body: JSON.stringify({ message: "No candidate available" }),
      });
    }
    return Promise.resolve({
      statusCode: 200,
      body: JSON.stringify({ message: "Withdrawal successful" }),
    });
  }),
}));

describe("withdrawRai", async () => {
  it("should return a 400 missing candidate when a requestedDate is missing", async () => {
    const response = await withdrawRai(
      {
        _id: "123",
        packageId: "456",
        authority: "1915(b)",
        receivedDate: new Date().toISOString(),
        requestedDate: new Date().toISOString(),
        status: "pending",
        type: "withdrawRai",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attachments: [],
        waiver: "Medicaid",
        waiverId: "789",
        waiverType: "Medicaid",
        message: "test",
      },
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
      {
        _id: "123",
        packageId: "456",
        authority: "1915(b)",
        candidateId: "789",
        status: "pending",
        type: "withdrawRai",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attachments: [],
        waiver: "Medicaid",
        waiverId: "789",
        waiverType: "Medicaid",
        message: "test",
      },
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

  it("should return a server error response if given bad body", async () => {
    const results = await withdrawRai(
      {
        id: "test-id",
        authority: "test-authority",
        origin: "test-origin",
        submitterName: "Test User",
        submitterEmail: "test@example.com",
        requestedDate: new Date().toISOString(),
        withdrawnDate: new Date().toISOString(),
        attachments: [],
        additionalInformation: null,
        timestamp: Date.now(),
      },
      {
        raiRequestedDate: null,
        raiReceivedDate: "asdf",
      },
    );

    // Assert the result
    expect(results.statusCode).toBe(400);
    expect(JSON.parse(results.body)).toEqual({
      message: "No candidate RAI available",
    });
  });
  it("should return a 400 when a bad requestDate is sent", async () => {
    const results = await withdrawRai(
      {
        id: "capillus",
        authority: "sursum",
        origin: "cohaero",
        requestedDate: -899, // Use a valid date string
        withdrawnDate: new Date().toISOString(), // Use a valid date string
        attachments: [
          {
            filename: "vita",
            title: "maxime",
            bucket: "curis",
            key: "aspicio",
            uploadDate: new Date().toISOString(), // Use a valid date string
          },
        ],
        additionalInformation: null,
        submitterName: "dolores",
        submitterEmail: "test@example.com",
        timestamp: Date.now(),
      },
      {
        raiRequestedDate: null,
        raiReceivedDate: "asdf",
      },
    );
    expect(results.statusCode).toBe(400);
    expect(JSON.parse(results.body)).toEqual({
      message: "No candidate RAI available",
    });
  });

  it("should return a 200 when a good payload is sent", async () => {
    const goodDate = new Date().toISOString();
    const packageWriteSpy = vi.spyOn(
      packageActionWriteService,
      "withdrawRaiAction",
    );
    const mockData = generateMock(raiWithdrawSchema);
    const response = await withdrawRai(mockData, {
      raiRequestedDate: goodDate,
      raiReceivedDate: goodDate,
    });
    expect(packageWriteSpy).toHaveBeenCalledOnce();
    expect(response.statusCode).toBe(200);
  });
});
