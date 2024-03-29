import { Handler } from "aws-lambda";
import { decode } from "base-64";
import * as os from "./../../../libs/opensearch-lib";
import { KafkaEvent, KafkaRecord } from "shared-types";
import { ErrorType, getTopic, logError } from "../libs/sink-lib";
const osDomain = process.env.osDomain;
if (!osDomain) {
  throw new Error("Missing required environment variable(s)");
}
const index = "legacyinsights";

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
            ...(await onemac(event.records[topicPartition], topicPartition)),
          );
          break;
      }
    }
    try {
      await os.bulkUpdateData(osDomain, index, docs);
    } catch (error: any) {
      logError({
        type: ErrorType.BULKUPDATE,
        metadata: { event: loggableEvent },
      });
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
    const { key, value, offset } = kafkaRecord;
    try {
      const id: string = decode(key);
      if (!value) {
        docs.push({
          id,
          hardDeletedFromLegacy: true,
        });
        continue;
      }
      const record = JSON.parse(decode(value));
      if (!record.sk) continue;
      docs.push({
        ...record,
        id: record.sk === "Package" ? id : offset.toString(),
        approvedEffectiveDate: null,
        changedDate: null,
        finalDispositionDate: null,
        proposedDate: null,
        proposedEffectiveDate: null,
        statusDate: null,
        submissionDate: null,
        hardDeletedFromLegacy: null,
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
