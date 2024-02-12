import { Handler } from "aws-lambda";
import { Kafka } from "kafkajs";
import { getConsumerGroupInfo } from "../libs/lambda-trigger-lib";

export const handler: Handler = async (
  event, 
  context, 
  callback
) => {
  const response = {
    statusCode: 200,
    stable: false,
    current: false,
    ready: false,
  };
  try {
    const triggerInfo: any[] = [];
    for (const functionName of event.Functions) {
      console.log(`Getting consumer groups for function: ${functionName}`);
      triggerInfo.push(...(await getConsumerGroupInfo(functionName)));
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
        let groupId :string = trigger.groupId;
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
        }
        console.log(`Topic: ${topic}, Group: ${groupId}, Latest Offset: ${latestOffset}, Current Offset: ${currentOffset}`);
      }
    }
    await admin.disconnect();
    response.stable = statuses.every(status => status === "Stable");
    response.current = Object.values(offsets).every(o => o.latestOffset === o.currentOffset);
    response.ready = response.stable && response.current;
  } catch (error: any) {
    response.statusCode = 500;
    callback(error, response);
  } finally {
    callback(null, response);
  }
};
