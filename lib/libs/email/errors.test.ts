import { describe, expect, it } from "vitest";
import { EmailProcessingError } from "./errors";

describe("EmailProcessingError", () => {
  it("should create an error with message and context", () => {
    const message = "Failed to process email";
    const context = {
      id: "test-id",
      actionType: "test-action",
      emailType: "test-email",
      additionalInfo: "test-info",
    };

    const error = new EmailProcessingError(message, context);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(EmailProcessingError);
    expect(error.message).toBe(message);
    expect(error.name).toBe("EmailProcessingError");
    expect(error.context).toEqual(context);
  });

  it("should allow additional context properties", () => {
    const error = new EmailProcessingError("test message", {
      id: "test-id",
      actionType: "test-action",
      emailType: "test-email",
      customProp1: "value1",
      customProp2: 123,
      customProp3: { nested: true },
    });

    expect(error.context).toEqual({
      id: "test-id",
      actionType: "test-action",
      emailType: "test-email",
      customProp1: "value1",
      customProp2: 123,
      customProp3: { nested: true },
    });
  });
});
