import { describe, it, expect, vi, beforeEach } from "vitest";
import { getForm } from "../getForm";

vi.mock("../../webforms", () => ({
  webforms: {
    TESTFORM: {
      "1.0": { name: "Test Form", version: "1.0" },
    },
  },
}));

describe("forms handler", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
  });

  it("returns 400 if event body is missing", async () => {
    const event = {};
    const result = await getForm(event as any); // Casting as any to simulate APIGatewayEvent
    expect(result.statusCode).toBe(400);
    expect(result.body).toContain("Event body required");
  });

  it("returns 400 if form ID is not provided", async () => {
    const event = {
      body: JSON.stringify({}), // Empty body
    };
    const result = await getForm(event as any);
    expect(result.statusCode).toBe(400);
    expect(result.body).toContain("File ID was not provided");
  });

  it("returns 400 if form ID is not found", async () => {
    const event = {
      body: JSON.stringify({ formId: "NONEXISTENT" }),
    };
    const result = await getForm(event as any);
    expect(result.statusCode).toBe(400);
    expect(result.body).toContain("Form ID not found");
  });

  it("returns 200 with form data if form ID and version are valid", async () => {
    const event = {
      body: JSON.stringify({ formId: "TESTFORM", formVersion: "1.0" }),
    };
    const result = await getForm(event as any);
    expect(result.statusCode).toBe(200);
    expect(result.body).toContain("Test Form");
  });
});
