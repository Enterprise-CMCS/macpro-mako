import { Handler } from "aws-lambda";
import { KafkaRecord, opensearch } from "shared-types";
import { KafkaEvent } from "shared-types";
import { decodeBase64WithUtf8 } from "shared-utils";

import { bulkUpdateDataWrapper, ErrorType, getTopic, logError } from "../libs/sink-lib";

export const handler: Handler<KafkaEvent> = async (event) => {
  const loggableEvent = { ...event, records: "too large to display" };
  try {
    for (const topicPartition of Object.keys(event.records)) {
      const topic = getTopic(topicPartition);
      switch (topic) {
        case "aws.seatool.debezium.cdc.SEA.dbo.Officers":
          await officers(event.records[topicPartition], topicPartition);
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

const officers = async (kafkaRecords: KafkaRecord[], topicPartition: string) => {
  const docs: any[] = [];
  for (const kafkaRecord of kafkaRecords) {
    const { key, value } = kafkaRecord;

    try {
      // Handle delete events and continue
      if (value === undefined) {
        continue;
      }

      // Set id
      const id: string = decodeBase64WithUtf8(key);

      const decodedValue = Buffer.from(value, "base64").toString("utf-8");
      const record = JSON.parse(decodedValue).payload.after;

      // Handle tombstone events and continue
      if (!record) {
        console.log(`Tombstone detected for ${id}.  Pushing delete record to os...`);
        docs.push({
          id,
          delete: true,
        });
        continue;
      }

      const result = opensearch.cpocs.Officers.transform().safeParse(record);
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

  await bulkUpdateDataWrapper(docs, "cpocs");
};
