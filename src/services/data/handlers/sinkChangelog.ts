import { Handler } from "aws-lambda";
import { decode } from "base-64";
import * as os from "./../../../libs/opensearch-lib";
import { Action, KafkaRecord } from "shared-types";
import { KafkaEvent } from "shared-types";
import { ErrorType, getTopic, logError } from "../libs/sink-lib";
const osDomain = process.env.osDomain;
if (!osDomain) {
  throw new Error("Missing required environment variable(s)");
}
const index = "changelog";

export const handler: Handler<KafkaEvent> = async (event) => {
  const loggableEvent = { ...event, records: "too large to display" };
  const docs: any[] = [];
  try {
    for (const topicPartition of Object.keys(event.records)) {
      const topic = getTopic(topicPartition);
      switch (topic) {
        case undefined:
          logError({ type: ErrorType.BADTOPIC });
          throw new Error();
        case "aws.onemac.migration.cdc":
          docs.push(
            ...(await onemac(event.records[topicPartition], topicPartition))
          );
          break;
      }
    }
    try {
      await os.bulkUpdateData(osDomain, index, docs);
    } catch (error: any) {
      logError({ type: ErrorType.BULKUPDATE });
      throw error;
    }
  } catch (error) {
    logError({ type: ErrorType.UNKNOWN, metadata: { event: loggableEvent } });
    throw error;
  }
};

const onemac = async (kafkaRecords: KafkaRecord[], topicPartition: string) => {
  const docs: any[] = [];
  for (const kafkaRecord of kafkaRecords) {
    const { key, value, offset, timestamp } = kafkaRecord;
    try {
      // Skip delete events
      if (!value) continue;

      const record = JSON.parse(decode(value));

      // Skip legacy events
      if (record?.origin !== "micro") continue;

      const id: string = decode(key);

      if (record?.actionType === Action.REMOVE_APPK_CHILD) {
        docs.push({
          ...record,
          appkChildId: record.id,
          timestamp,
          id: `${record.appkParentId}-${offset}`,
          packageId: record.appkParentId,
        });
        continue;
      }

      // Handle everything else
      docs.push({
        ...record,
        ...(!record?.actionType && { actionType: "new-submission" }), // new-submission custom actionType
        timestamp,
        id: `${id}-${offset}`,
        packageId: id,
      });
    } catch (error) {
      logError({
        type: ErrorType.BADPARSE,
        error,
        metadata: { topicPartition, kafkaRecord },
      });
    }
  }
  return docs;
};
