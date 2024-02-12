import { Handler } from "aws-lambda";
import { send, SUCCESS, FAILED } from "cfn-response-async";
type ResponseStatus = typeof SUCCESS | typeof FAILED;
import { Kafka } from "kafkajs";
import { getConsumerGroupInfo } from "../libs/lambda-trigger-lib";

export const customResourceWrapper: Handler = async (event, context) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
  const responseData = {};
  let responseStatus: ResponseStatus = SUCCESS;
  const timeoutMinutes = 14; // Timeout after 14 minutes
  const sleepDurationMs = 30 * 1000; // Sleep for 30 seconds
  const startTime = Date.now();
  try {
    if (event.RequestType == "Create" || event.RequestType == "Update") {
      if (!process.env.functions) {
        throw "process.env.functions cannot be undefined";
      }
      let ready = false;
      while (!ready) {
        const timeSpentMs = Date.now() - startTime;
        if (timeSpentMs > timeoutMinutes * 60 * 1000) {
          throw new Error("Timeout reached while waiting for consumer groups to be ready.");
        }
        
        const { ready: isReady } = await checkStableAndCurrent(process.env.functions.split(","));
        ready = isReady;

        if (!ready) {
          console.log(`Waiting for consumer groups to be ready. Sleeping for ${sleepDurationMs / 1000} seconds.`);
          await new Promise(resolve => setTimeout(resolve, sleepDurationMs));
        }
      }
      console.log("Consumer groups are ready.");
    }
  } catch (error) {
    console.log(error);
    responseStatus = FAILED;
  } finally {
    console.log("finally");
    await send(event, context, responseStatus, responseData);
  }
};

export const checkStableAndCurrent = async (functionNames: string[]) => {
  const response = {
    stable: false,
    current: false,
    ready: false,
  };
  try {
    const triggerInfo: any[] = [];
    for (const functionName of functionNames) {
      console.log(`Getting consumer groups for function: ${functionName}`);
      triggerInfo.push(...(await getConsumerGroupInfo(functionName)));
    }
    const kafka = new Kafka({
      clientId: "consumerGroupResetter",
      brokers: process.env.brokerString?.split(",") || [],
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
  } catch(error) {
    console.log("An unknown error occured.");
    throw(error)
  } finally {
    console.log(response);
    return response;
  }
};

export const getLookupLag: Handler = async (
  event, 
  context, 
  callback
) => {
  try {
    if (!process.env.functions) {
      throw "process.env.functions cannot be undefined";
    }
    const { stable, current, ready } = await checkStableAndCurrent(process.env.functions.split(","));
    callback(null, { statusCode: 200, stable, current, ready });
  } catch(error) {
    console.log("An uknown error occured.");
    throw(error)
  }
};
