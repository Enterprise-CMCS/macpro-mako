import { Handler } from "aws-lambda";
import { KafkaRecord, opensearch } from "shared-types";
import { KafkaEvent } from "shared-types";

import { bulkUpdateDataWrapper, ErrorType, getTopic, logError } from "../libs/sink-lib";

export const handler: Handler<KafkaEvent> = async (event) => {
  const loggableEvent = { ...event, records: "too large to display" };

  try {
    for (const topicPartition of Object.keys(event.records)) {
      const topic = getTopic(topicPartition);
      switch (topic) {
        case "aws.seatool.debezium.cdc.SEA.dbo.Type":
          await subtypes(event.records[topicPartition], topicPartition);
          break;
        default:
          logError({ type: ErrorType.BADTOPIC });
          throw new Error(`topic (${topicPartition}) is invalid`);
      }
    }
  } catch (error) {
    logError({ type: ErrorType.UNKNOWN, metadata: { event: loggableEvent } });
    throw error;
  }
};

const subtypes = async (kafkaRecords: KafkaRecord[], topicPartition: string) => {
  const docs: any[] = [];
  for (const kafkaRecord of kafkaRecords) {
    const { value } = kafkaRecord;
    try {
      const decodedValue = Buffer.from(value, "base64").toString("utf-8");
      const record = JSON.parse(decodedValue).payload.after;
      if (!record) {
        continue;
      }
      const result = opensearch.subtypes.Type.transform().safeParse(record);
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
  await bulkUpdateDataWrapper(docs, "subtypes");
};
