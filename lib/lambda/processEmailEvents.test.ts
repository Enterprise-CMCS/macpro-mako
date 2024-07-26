import { describe, it, expect, vi } from "vitest";
import { SNSEvent, Context, Callback } from "aws-lambda";
import { main } from "./processEmailEvents"; // replace with the actual path to your main function

describe("main", () => {
  const mockContext: Context = {} as Context;
  const mockCallback: Callback = vi.fn();

  const createMockEvent = (): SNSEvent => ({
    Records: [
      {
        EventSource: "aws:sns",
        EventVersion: "1.0",
        EventSubscriptionArn: "arn:aws:sns:EXAMPLE",
        Sns: {
          Type: "Notification",
          MessageId: "95df01b4-ee98-5cb9-9903-4c221d41eb5e",
          TopicArn: "arn:aws:sns:EXAMPLE",
          Subject: "example subject",
          Message: "example message",
          Timestamp: "1970-01-01T00:00:00.000Z",
          SignatureVersion: "1",
          Signature: "EXAMPLE",
          SigningCertUrl: "EXAMPLE",
          UnsubscribeUrl: "EXAMPLE",
          MessageAttributes: {},
        },
      },
    ],
  });

  it('should log the received message and call the callback with "Success"', async () => {
    const mockEvent = createMockEvent();
    const consoleLogSpy = vi.spyOn(console, "log");

    await main(mockEvent, mockContext, mockCallback);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Received email event, stringified:",
      JSON.stringify(mockEvent, null, 4),
    );
    expect(consoleLogSpy).toHaveBeenCalledWith("Message received from SNS:", {
      simpleMessage: "example message",
    });
    expect(mockCallback).toHaveBeenCalledWith(null, "Success");

    consoleLogSpy.mockRestore();
  });
});
