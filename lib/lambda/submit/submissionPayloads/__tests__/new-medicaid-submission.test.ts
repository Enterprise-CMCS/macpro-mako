import { describe, test, expect, vi } from "vitest";
import { newMedicaidSubmission } from "../new-medicaid-submission";
import { APIGatewayEvent } from "aws-lambda";

// Mock dependencies
vi.mock("../../../../libs/api/auth/user", () => ({
  isAuthorized: vi.fn().mockResolvedValue(true),
  getAuthDetails: vi.fn().mockReturnValue({ userId: "test", poolId: "test" }),
  lookupUserAttributes: vi.fn().mockResolvedValue({
    email: "test@example.com",
    given_name: "Test",
    family_name: "User",
  }),
}));

vi.mock("libs/api/package", () => ({
  itemExists: vi.fn().mockResolvedValue(false),
}));

describe("newMedicaidSubmission handler", () => {
  const mockEvent: Partial<APIGatewayEvent> = {
    body: JSON.stringify({
      id: "MD-00-0001",
      event: "new-medicaid-submission",
      authority: "Medicaid SPA",
      proposedEffectiveDate: Date.now(),
    }),
  };

  test("processes draft submission with minimal validation", async () => {
    const draftEvent = {
      ...mockEvent,
      body: JSON.stringify({
        ...JSON.parse(mockEvent.body!),
        submissionStatus: "draft",
      }),
    };

    const result = await newMedicaidSubmission(draftEvent as APIGatewayEvent);

    expect(result).toMatchObject({
      id: "MD-00-0001",
      submissionStatus: "draft",
      submitterEmail: "test@example.com",
      submitterName: "Test User",
    });
  });

  test("requires full validation for regular submission", async () => {
    const result = await newMedicaidSubmission(mockEvent as APIGatewayEvent);

    expect(result).toMatchObject({
      id: "MD-00-0001",
      submissionStatus: "submitted",
      submitterEmail: "test@example.com",
      submitterName: "Test User",
    });
  });

  test("throws error for invalid draft submission", async () => {
    const invalidDraftEvent = {
      ...mockEvent,
      body: JSON.stringify({
        submissionStatus: "draft",
        // Missing required fields like id
      }),
    };

    await expect(newMedicaidSubmission(invalidDraftEvent as APIGatewayEvent)).rejects.toThrow();
  });
});
