import { Handler } from "aws-lambda";
import { decodeBase64WithUtf8 } from "shared-utils";
import { KafkaEvent, KafkaRecord } from "shared-types";
import {
  ErrorType,
  bulkUpdateDataWrapper,
  getTopic,
  logError,
} from "../libs/sink-lib";
import { Index } from "shared-types/opensearch";
const osDomain = process.env.osDomain;
if (!osDomain) {
  throw new Error("Missing required environment variable(s)");
}
const index: Index = `${process.env.indexNamespace}insights`;

export const handler: Handler<KafkaEvent> = async (event) => {
  const loggableEvent = { ...event, records: "too large to display" };
  try {
    for (const topicPartition of Object.keys(event.records)) {
      const topic = getTopic(topicPartition);
      switch (topic) {
        case undefined:
          logError({ type: ErrorType.BADTOPIC });
          throw new Error();
        case "aws.seatool.ksql.onemac.v2.agg.State_Plan":
          await ksql(event.records[topicPartition], topicPartition);
          break;
      }
    }
  } catch (error) {
    logError({ type: ErrorType.UNKNOWN, metadata: { event: loggableEvent } });
    throw error;
  }
};

const ksql = async (kafkaRecords: KafkaRecord[], topicPartition: string) => {
  const docs: any[] = [];
  for (const kafkaRecord of kafkaRecords) {
    const { key, value } = kafkaRecord;
    try {
      if (!value) continue;

      const id: string = JSON.parse(decodeBase64WithUtf8(key));
      const record = JSON.parse(decodeBase64WithUtf8(value));
      docs.push({ ...record, id });
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
