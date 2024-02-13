import { Handler } from "aws-lambda";
import { Kafka } from "kafkajs";
import { LambdaClient, ListEventSourceMappingsCommand } from "@aws-sdk/client-lambda";

export const handler: Handler = async (
  event, 
  _, 
  callback
) => {
  const response = {
    statusCode: 200,
    stable: false,
    current: false,
    ready: false,
  };
  let errorResponse = null;
  try {
    const triggerInfo: any[] = [];
    const lambdaClient = new LambdaClient({});
    for(const trigger of event.Triggers) {
      for(const topic of [...new Set(trigger.Topics)]) {
        console.log(`Getting consumer groups for function: ${trigger.Function} and topic ${topic}`);
        const response = await lambdaClient.send(
          new ListEventSourceMappingsCommand({ FunctionName: trigger.Function })
        );
        if(!response.EventSourceMappings){
          throw `ERROR:  No event source mapping found for function ${trigger.Function} and topic ${topic}`;
        }
        const mappingForCurrentTopic = response.EventSourceMappings.filter(mapping => 
          mapping.Topics && mapping.Topics.includes(topic as string)
        );
        if(mappingForCurrentTopic.length > 1){
          throw `ERROR:  Multiple event source mappings found for function ${trigger.Function} and topic ${topic}`;
        }
        triggerInfo.push({
          groupId: mappingForCurrentTopic[0].SelfManagedKafkaEventSourceConfig?.ConsumerGroupId,
          topics: [topic],
        });
      }
    }
    const kafka = new Kafka({
      clientId: "consumerGroupResetter",
      brokers: event.BrokerString?.split(",") || [],
      ssl: true,
    });
    const admin = await kafka.admin();
    await admin.connect();
    
    // Get status for each consumer group
    const info = await admin.describeGroups(triggerInfo.map((a) => a.groupId));
    const statuses = info.groups.map((a) => a.state.toString());
    // Get topic and group offset for each consumer group
    let offsets: { [key: string]: any } = {};
    for (const trigger of triggerInfo) {
      for (const topic of trigger.topics) {
        const groupId :string = trigger.groupId;
        const topicOffsets = await admin.fetchTopicOffsets(topic);
        const groupOffsets = await admin.fetchOffsets({
          groupId,
          topics: [topic],
        });
        // Assuming there's a single partition for simplicity.
        const latestOffset = topicOffsets[0].offset;
        const currentOffset = groupOffsets[0].partitions[0].offset;
        offsets[groupId] = {
          latestOffset,
          currentOffset,
        };
        console.log(`Topic: ${topic}, Group: ${groupId}, Latest Offset: ${latestOffset}, Current Offset: ${currentOffset}`);
      }
    }
    await admin.disconnect();
    response.stable = statuses.every(status => status === "Stable");
    response.current = Object.values(offsets).every(o => o.latestOffset === o.currentOffset);
    response.ready = response.stable && response.current;
  } catch (error: any) {
    response.statusCode = 500;
    errorResponse = error;
  } finally {
    callback(errorResponse, response);
  }
};
