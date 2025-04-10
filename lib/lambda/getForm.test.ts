import { webformVersions } from "libs/webforms";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getForm } from "./getForm";

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
      body: JSON.stringify({ formId: "ABP1", formVersion: "202401" }),
    };
    const result = await getForm(event as any);
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).header).toBe(webformVersions["ABP1"]["v202401"].header);
  });
  it("returns 200 with form data if form ID and version are valid", async () => {
    const event = {
      body: JSON.stringify({ formId: "ABP1", formVersion: "" }),
    };
    const result = await getForm(event as any);
    expect(result.statusCode).toBe(200);
    expect(result.body).toBe("{}");
  });
  it("returns 502 because the body is invalid json", async () => {
    const event = {
      body: "kdjfkldjj:[df",
    };
    const result = await getForm(event as any);
    expect(result.statusCode).toBe(502);
  });
});
