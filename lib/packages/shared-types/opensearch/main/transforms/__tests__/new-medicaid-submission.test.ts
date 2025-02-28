import { describe, test, expect } from "vitest";
import { transform } from "../new-medicaid-submission";
import { events } from "shared-types";

describe("new-medicaid-submission transform", () => {
  const mockData = {
    id: "MD-00-0001",
    event: "new-medicaid-submission",
    authority: "Medicaid SPA",
    proposedEffectiveDate: Date.now(),
    additionalInformation: "Test info",
    submitterEmail: "test@example.com",
    submitterName: "Test User",
    timestamp: Date.now(),
    submissionStatus: "draft" as const,
  };

  test("transforms draft submission correctly", () => {
    const result = transform()(mockData);

    expect(result).toMatchObject({
      id: mockData.id,
      submissionStatus: "draft",
      seatoolStatus: "DRAFT",
      initialIntakeNeeded: true,
    });
  });

  test("transforms regular submission correctly", () => {
    const regularData = {
      ...mockData,
      submissionStatus: "submitted" as const,
    };

    const result = transform()(regularData);

    expect(result).toMatchObject({
      id: regularData.id,
      submissionStatus: "submitted",
      seatoolStatus: "SUBMITTED",
      initialIntakeNeeded: true,
    });
  });

  test("defaults to submitted status if not specified", () => {
    const dataWithoutStatus = {
      ...mockData,
      submissionStatus: undefined,
    };

    const result = transform()(dataWithoutStatus);

    expect(result).toMatchObject({
      submissionStatus: "submitted",
      seatoolStatus: "SUBMITTED",
    });
  });
});
