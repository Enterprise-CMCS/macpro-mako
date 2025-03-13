import { CloudFormationCustomResourceEvent, Context } from "aws-lambda";
import { describe, expect, it, vi } from "vitest";

import * as topics from "../../../libs/topics-lib";

import { handler } from "./cleanupKafka";

vi.mock("../../../libs/topics-lib");

describe("handler", () => {
  const BrokerString = "someBrokerString";
  const TopicPatternsToDelete = ["--valid--pattern--", "--another--pattern--"];
  const invalidTopicPatternsToDelete = ["invalidPattern", "--valid--pattern--"];
  const context: Context = {} as Context;

  const event: CloudFormationCustomResourceEvent = {
    RequestType: "Delete",
    ServiceToken: "",
    ResponseURL: "",
    StackId: "",
    RequestId: "",
    LogicalResourceId: "",
    ResourceType: "",
    ResourceProperties: {
      brokerString: BrokerString,
      topicPatternsToDelete: TopicPatternsToDelete,
    },
  };

  it("should log request and delete topics successfully", async () => {
    (topics.deleteTopics as vi.Mock).mockResolvedValue(undefined);

    await handler(event, context);

    expect(topics.deleteTopics).toHaveBeenCalledWith(BrokerString, TopicPatternsToDelete);
    expect(topics.deleteTopics).toHaveBeenCalledTimes(1);
  });

  it("should throw an error for invalid pattern format", async () => {
    const invalidEvent = {
      ...event,
      ResourceProperties: {
        brokerString: BrokerString,
        topicPatternsToDelete: invalidTopicPatternsToDelete,
      },
    };

    await expect(handler(invalidEvent, context)).rejects.toThrow(
      'Pattern "invalidPattern" does not start with the required format.  Refusing to continue.',
    );
  });
});
