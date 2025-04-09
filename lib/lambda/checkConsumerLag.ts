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
          function: trigger.function, // Store function name for better logging
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
    const offsets: { [key: string]: boolean } = {};
    const partitionDetails: { [key: string]: any[] } = {};

    for (const trigger of triggerInfo) {
      const groupId: string = trigger.groupId;
      offsets[groupId] = true; // Initialize as current
      partitionDetails[groupId] = [];

      for (const topic of trigger.topics) {
        // Get latest offsets for all partitions in the topic
        const topicOffsets = await admin.fetchTopicOffsets(topic);

        // Get consumer group offsets for all partitions
        const groupOffsets = await admin.fetchOffsets({
          groupId,
          topics: [topic],
        });

        // Create a map of partition to latest offset for easier lookup
        const latestOffsetsByPartition = topicOffsets.reduce(
          (map, partition) => {
            map[partition.partition] = partition.offset;
            return map;
          },
          {} as Record<number, string>,
        );

        // Check each partition in the consumer group offsets
        for (const topicInfo of groupOffsets) {
          if (topicInfo.topic !== topic) continue;

          for (const partition of topicInfo.partitions) {
            const partitionId = partition.partition;
            const currentOffset = partition.offset === "-1" ? "0" : partition.offset;
            const latestOffset = latestOffsetsByPartition[partitionId];

            if (!latestOffset) {
              console.warn(
                `Warning: No latest offset found for topic ${topic}, partition ${partitionId}`,
              );
              continue;
            }

            // Calculate lag
            const lag = parseInt(latestOffset) - parseInt(currentOffset);

            // Store details for logging
            partitionDetails[groupId].push({
              topic,
              partition: partitionId,
              currentOffset,
              latestOffset,
              lag,
            });

            // Log the offset information
            console.log(
              `Topic: ${topic}, Partition: ${partitionId}, Group: ${groupId}, Latest Offset: ${latestOffset}, Current Offset: ${currentOffset}, Lag: ${lag}`,
            );

            // If any partition is not current, mark the entire consumer group as not current
            if (currentOffset !== latestOffset) {
              offsets[groupId] = false;
            }
          }
        }
      }
    }

    await admin.disconnect();

    response.stable = statuses.every((status) => status === "Stable");
    response.current = Object.values(offsets).every((isCurrent) => isCurrent === true);
    response.ready = response.stable && response.current;

    console.log(
      `Status: stable=${response.stable}, current=${response.current}, ready=${response.ready}`,
    );
    console.log("Partition details:", JSON.stringify(partitionDetails, null, 2));
  } catch (error: any) {
    console.error("Error:", error);
    response.statusCode = 500;
    errorResponse = error;
  } finally {
    callback(errorResponse, response);
  }
};
