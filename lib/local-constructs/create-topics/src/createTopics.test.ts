import { describe, it, expect, vi } from "vitest";
import { handler } from "./createTopics";
import * as topics from "./../../../libs/topics-lib";
import { CloudFormationCustomResourceEvent, Context } from "aws-lambda";

vi.mock("./../../../libs/topics-lib");

describe("handler", () => {
  const brokerString = "someBrokerString";
  const validTopicsToCreate = [
    { topic: "validTopic", numPartitions: 3, replicationFactor: 3 },
    { topic: "anotherValidTopic", numPartitions: 1, replicationFactor: 3 },
  ];
  const invalidTopicsToCreateNoName = [{ topic: "", numPartitions: 3, replicationFactor: 3 }];
  const invalidTopicsToCreateLowReplication = [
    { topic: "validTopic", numPartitions: 3, replicationFactor: 2 },
  ];
  const invalidTopicsToCreateLowPartitions = [
    { topic: "validTopic", numPartitions: 0, replicationFactor: 3 },
  ];
  const context: Context = expect.anything();

  const event: CloudFormationCustomResourceEvent = {
    RequestType: "Create",
    ServiceToken: "",
    ResponseURL: "",
    StackId: "",
    RequestId: "",
    LogicalResourceId: "",
    ResourceType: "",
    ResourceProperties: {
      brokerString: brokerString,
      topicsToCreate: validTopicsToCreate,
    },
  };

  it("should log request and create topics successfully", async () => {
    (topics.createTopics as vi.Mock).mockResolvedValue(undefined);

    await handler(event, context);

    expect(topics.createTopics).toHaveBeenCalledWith(brokerString, validTopicsToCreate);
    expect(topics.createTopics).toHaveBeenCalledTimes(1);
  });

  it("should throw an error for missing topic name", async () => {
    const invalidEvent = {
      ...event,
      ResourceProperties: {
        brokerString: brokerString,
        topicsToCreate: invalidTopicsToCreateNoName,
      },
    };

    await expect(handler(invalidEvent, context)).rejects.toThrow(
      "Invalid configuration for topicsToCreate.  All entries must have a 'name' key with a string value.",
    );
  });

  it("should throw an error for replicationFactor less than 3", async () => {
    const invalidEvent = {
      ...event,
      ResourceProperties: {
        brokerString: brokerString,
        topicsToCreate: invalidTopicsToCreateLowReplication,
      },
    };

    await expect(handler(invalidEvent, context)).rejects.toThrow(
      "Invalid configuration for topicsToCreate.  If specified, replicationFactor must be greater than or equal to 3.",
    );
  });

  it("should throw an error for numPartitions less than 1", async () => {
    const invalidEvent = {
      ...event,
      ResourceProperties: {
        brokerString: brokerString,
        topicsToCreate: invalidTopicsToCreateLowPartitions,
      },
    };

    await expect(handler(invalidEvent, context)).rejects.toThrow(
      "Invalid configuration for topicsToCreate.  If specified, numPartitions must be greater than or equal to 1.",
    );
  });
});
