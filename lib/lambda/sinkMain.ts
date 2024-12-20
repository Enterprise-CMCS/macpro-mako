import { Handler } from "aws-lambda";
import { KafkaEvent, KafkaRecord } from "shared-types";
import { ErrorType, getTopic, logError } from "libs";
import {
  insertOneMacRecordsFromKafkaIntoMako,
  insertNewSeatoolRecordsFromKafkaIntoMako,
  syncSeatoolRecordDatesFromKafkaWithMako,
} from "./sinkMainProcessors";

export const handler: Handler<KafkaEvent> = async (event) => {
  const eventInfo = JSON.stringify(event, null, 2);
  console.log(`Received event: ${eventInfo}`);

  try {
    // Process each topicPartition concurrently
    await Promise.all(
      Object.entries(event.records).map(async ([topicPartition, records]) =>
        processTopicPartition(topicPartition, records),
      ),
    );
  } catch (error) {
    logError({ type: ErrorType.UNKNOWN, metadata: { event: eventInfo } });
    throw error;
  }
};

async function processTopicPartition(topicPartition: string, records: KafkaRecord[]): Promise<void> {
  const topic = getTopic(topicPartition);
  if (!topic) {
    logError({ type: ErrorType.BADTOPIC });
    throw new Error(`Invalid topic: ${topicPartition}`);
  }

  switch (topic) {
    case "aws.onemac.migration.cdc":
      await insertOneMacRecordsFromKafkaIntoMako(records, topicPartition);
      break;
    case "aws.seatool.ksql.onemac.three.agg.State_Plan":
      await insertNewSeatoolRecordsFromKafkaIntoMako(records, topicPartition);
      break;
    case "aws.seatool.debezium.changed_date.SEA.dbo.State_Plan":
      await syncSeatoolRecordDatesFromKafkaWithMako(records, topicPartition);
      break;
    default:
      logError({ type: ErrorType.BADTOPIC, metadata: { topic } });
      throw new Error(`Unsupported topic: ${topic}`);
  }
}