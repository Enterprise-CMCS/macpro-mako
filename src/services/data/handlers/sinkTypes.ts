import { Handler } from "aws-lambda";
import { KafkaRecord, opensearch } from "shared-types";
import { KafkaEvent } from "shared-types";
import {
  ErrorType,
  bulkUpdateDataWrapper,
  getTopic,
  logError,
} from "../libs/sink-lib";
const osDomain = process.env.osDomain;
if (!osDomain) {
  throw new Error("Missing required environment variable(s)");
}
const index = "types";

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
        case "aws.seatool.debezium.cdc.SEA.dbo.SPA_Type":
          await types(event.records[topicPartition], topicPartition);
          break;
      }
    }
  } catch (error) {
    logError({ type: ErrorType.UNKNOWN, metadata: { event: loggableEvent } });
    throw error;
  }
};

const types = async (kafkaRecords: KafkaRecord[], topicPartition: string) => {
  const docs: any[] = [];
  for (const kafkaRecord of kafkaRecords) {
    const { value } = kafkaRecord;
    try {
      const decodedValue = Buffer.from(value, "base64").toString("utf-8");
      const record = JSON.parse(decodedValue).payload.after;
      if (!record) {
        continue;
      }
      const result = opensearch.types.SPA_Type.transform().safeParse(record);
      if (!result.success) {
        logError({
          type: ErrorType.VALIDATION,
          error: result?.error,
          metadata: { topicPartition, kafkaRecord, record },
        });
        continue;
      }
      docs.push(result.data);
    } catch (error) {
      logError({
        type: ErrorType.BADPARSE,
        error,
        metadata: { topicPartition, kafkaRecord },
      });
    }
  }
  await bulkUpdateDataWrapper(osDomain, index, docs);
};
