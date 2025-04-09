import { LambdaClient, ListEventSourceMappingsCommand } from "@aws-sdk/client-lambda";
import { Handler } from "aws-lambda";
import { Kafka } from "kafkajs";

export const handler: Handler = async (event, _, callback) => {
  const response = {
    statusCode: 200,
    stable: false,
    current: false,
    ready: false,
  };
  let errorResponse = null;
  try {
    const triggerInfo: any[] = [];
    const lambdaClient = new LambdaClient({
      region: process.env.region,
    });
    for (const trigger of event.triggers) {
      for (const topic of [...new Set(trigger.topics)]) {
        // console.log(`Getting consumer groups for function: ${trigger.function} and topic ${topic}`);
        const lambdaResponse = await lambdaClient.send(
          new ListEventSourceMappingsCommand({
            FunctionName: trigger.function,
          }),
        );
        if (
          !lambdaResponse.EventSourceMappings ||
          lambdaResponse.EventSourceMappings.length === 0
        ) {
          throw new Error(
            `ERROR: No event source mapping found for function ${trigger.function} and topic ${topic}`,
          );
        }
        const mappingForCurrentTopic = lambdaResponse.EventSourceMappings.filter(
          (mapping) => mapping.Topics && mapping.Topics.includes(topic as string),
        );
        if (!mappingForCurrentTopic || mappingForCurrentTopic.length === 0) {
          throw new Error(
            `ERROR: No event source mapping found for function ${trigger.function} and topic ${topic}`,
          );
        }
        if (mappingForCurrentTopic.length > 1) {
          throw new Error(
            `ERROR: Multiple event source mappings found for function ${trigger.function} and topic ${topic}`,
          );
        }
        const groupId =
          mappingForCurrentTopic[0]?.SelfManagedKafkaEventSourceConfig?.ConsumerGroupId;
        if (!groupId) {
          throw new Error(
            `ERROR: No ConsumerGroupId found for function ${trigger.function} and topic ${topic}`,
          );
        }
        triggerInfo.push({
          groupId,
          topics: [topic],
        });
      }
    }
    const kafka = new Kafka({
      clientId: "consumerGroupResetter",
      brokers: event.brokerString?.split(",") || [],
      ssl: true,
    });
    const admin = kafka.admin();
    await admin.connect();

    // Get status for each consumer group
    const info = await admin.describeGroups(triggerInfo.map((a) => a.groupId));
    const statuses = info.groups.map((a) => a.state.toString());
    // Get topic and group offset for each consumer group
    const offsets: { [key: string]: any } = {};
    for (const trigger of triggerInfo) {
      for (const topic of trigger.topics) {
        const groupId: string = trigger.groupId;
        const topicOffsets = await admin.fetchTopicOffsets(topic);
        const groupOffsets = await admin.fetchOffsets({
          groupId,
          topics: [topic],
        });
        // Assuming there's a single partition for simplicity.
        const latestOffset = topicOffsets[0].offset;
        const currentOffset = groupOffsets[0].partitions[0].offset;
        console.log("Group offsets:" + groupOffsets);
        console.log("latest offsets: " + topicOffsets);
        offsets[groupId] = {
          latestOffset,
          currentOffset,
        };
        console.log(
          `Topic: ${topic}, Group: ${groupId}, Latest Offset: ${latestOffset}, Current Offset: ${currentOffset}`,
        );
      }
    }
    await admin.disconnect();
    response.stable = statuses.every((status) => status === "Stable");
    response.current = Object.values(offsets).every((o) => o.latestOffset === o.currentOffset);
    response.ready = response.stable && response.current;
  } catch (error: any) {
    response.statusCode = 500;
    errorResponse = error;
  } finally {
    callback(errorResponse, response);
  }
};
