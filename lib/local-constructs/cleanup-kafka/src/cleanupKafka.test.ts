import { describe, it, expect, vi, Mock } from "vitest";
import { handler } from "./cleanupKafka";
import * as topics from "lib/libs/topics-lib";
import { CloudFormationCustomResourceEvent } from "aws-lambda";

vi.mock("lib/libs/topics-lib");

describe("handler", () => {
  const BrokerString = "someBrokerString";
  const TopicPatternsToDelete = ["--valid--pattern--", "--another--pattern--"];
  const invalidTopicPatternsToDelete = ["invalidPattern", "--valid--pattern--"];

  const event: CloudFormationCustomResourceEvent = {
    RequestType: "Delete",
    PhysicalResourceId: "somePhysicalResourceId",
    ResponseURL: "someResponseURL",
    StackId: "someStackId",
    RequestId: "someRequestId",
    LogicalResourceId: "someLogicalResourceId",
    ResourceType: "someResourceType",
    ServiceToken: "arn:aws:lambda:us-east-1:123456789012:function:test-function",
    ResourceProperties: {
      brokerString: BrokerString,
      topicPatternsToDelete: TopicPatternsToDelete,
      ServiceToken: "arn:aws:lambda:us-east-1:123456789012:function:test-function",
    },
  };

  it("should log request and delete topics successfully", async () => {
    (topics.deleteTopics as Mock).mockResolvedValue(undefined);

    await handler(event);

    expect(topics.deleteTopics).toHaveBeenCalledWith(BrokerString, TopicPatternsToDelete);
    expect(topics.deleteTopics).toHaveBeenCalledTimes(1);
  });

  it("should throw an error for invalid pattern format", async () => {
    const invalidEvent = {
      ...event,
      ResourceProperties: {
        brokerString: BrokerString,
        topicPatternsToDelete: invalidTopicPatternsToDelete,
        ServiceToken: "arn:aws:lambda:us-east-1:123456789012:function:test-function",
      },
    };

    await expect(handler(invalidEvent)).rejects.toThrow(
      'Pattern "invalidPattern" does not start with the required format.  Refusing to continue.',
    );
  });
});
