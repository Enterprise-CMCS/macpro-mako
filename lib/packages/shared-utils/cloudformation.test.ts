import { describe, it, expect, vi, beforeEach } from "vitest";
import { getExport } from ".";

const mockSend = vi.fn();

vi.mock("@aws-sdk/client-cloudformation", () => {
  return {
    CloudFormationClient: vi.fn(() => ({
      send: mockSend,
    })),
    ListExportsCommand: vi.fn(),
  };
});

describe("getExport", () => {
  beforeEach(() => {
    mockSend.mockClear();
  });

  it("should return the export value if the export exists", async () => {
    const exportName = "test-export";
    const expectedValue = "test-value";

    mockSend.mockResolvedValueOnce({
      Exports: [{ Name: exportName, Value: expectedValue }],
    });

    const result = await getExport(exportName);
    expect(result).toBe(expectedValue);
  });

  it("should throw an error if the export does not exist", async () => {
    const exportName = "non-existent-export";

    mockSend.mockResolvedValueOnce({
      Exports: [],
    });

    await expect(getExport(exportName)).rejects.toThrow(
      `Export with name ${exportName} does not exist.`,
    );
  });

  it("should throw an error if there is an issue with the AWS SDK call", async () => {
    const exportName = "test-export";
    const errorMessage = "AWS SDK error";

    mockSend.mockRejectedValueOnce(new Error(errorMessage));

    await expect(getExport(exportName)).rejects.toThrow(errorMessage);
  });
});
