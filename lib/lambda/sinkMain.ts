import { Handler } from "aws-lambda";
import { KafkaRecord, opensearch } from "shared-types";
import { KafkaEvent } from "shared-types";
import {
  ErrorType,
  bulkUpdateDataWrapper,
  getTopic,
  logError,
} from "../libs/sink-lib";
import { Index } from "shared-types/opensearch";
import { decodeBase64WithUtf8 } from "shared-utils";

const osDomain = process.env.osDomain;
if (!osDomain) {
  throw new Error("Missing required environment variable(s)");
}
const index: Index = `${process.env.indexNamespace}main`;

export const handler: Handler<KafkaEvent> = async (event) => {
  const loggableEvent = { ...event, records: "too large to display" };
  try {
    for (const topicPartition of Object.keys(event.records)) {
      const topic = getTopic(topicPartition);
      switch (topic) {
        case undefined:
          logError({ type: ErrorType.BADTOPIC });
          throw new Error();
        case "aws.onemac.migration.cdc":
          await processAndIndex({
            kafkaRecords: event.records[topicPartition],
            index,
            osDomain,
            transforms: opensearch.main.transforms,
            topicPartition: topicPartition,
          });
          break;
        case "aws.seatool.ksql.onemac.agg.State_Plan":
          await ksql(event.records[topicPartition], topicPartition);
          break;
        case "aws.seatool.debezium.changed_date.SEA.dbo.State_Plan":
          await changed_date(event.records[topicPartition], topicPartition);
          break;
      }
    }
  } catch (error) {
    logError({ type: ErrorType.UNKNOWN, metadata: { event: loggableEvent } });
    throw error;
  }
};

const processAndIndex = async ({
  kafkaRecords,
  index,
  osDomain,
  transforms,
  topicPartition,
}: {
  kafkaRecords: KafkaRecord[];
  index: Index;
  osDomain: string;
  transforms: any;
  topicPartition: string;
}) => {
  const docs: Array<(typeof transforms)[keyof typeof transforms]["Schema"]> =
    [];
  for (const kafkaRecord of kafkaRecords) {
    console.log(JSON.stringify(kafkaRecord, null, 2));
    const { value } = kafkaRecord;
    try {
      // If a legacy tombstone, handle and continue
      // TODO:  handle.  for now, just continue
      if (!value) {
        // docs.push(opensearch.main.legacyPackageView.tombstone(id));
        continue;
      }

      // Parse the kafka record's value
      const record = JSON.parse(decodeBase64WithUtf8(value));

      // If we're not a mako event, continue
      // TODO:  handle legacy.  for now, just continue
      if (!record.event || record?.origin !== "mako") {
        continue;
      }

      // If the event is a supported event, transform and push to docs array for indexing
      console.log("event below");
      console.log(record.event);

      if (record.event in transforms) {
        const transformForEvent =
          transforms[record.event as keyof typeof transforms];

        const result = transformForEvent.transform().safeParse(record);

        if (result.success && result.data === undefined) continue;
        if (!result.success) {
          logError({
            type: ErrorType.VALIDATION,
            error: result?.error,
            metadata: { topicPartition, kafkaRecord, record },
          });
          continue;
        }
        console.log(JSON.stringify(result.data, null, 2));
        docs.push(result.data);
      } else {
        console.log(`No transform found for event: ${record.event}`);
      }
    } catch (error) {
      logError({
        type: ErrorType.BADPARSE,
        error,
        metadata: { topicPartition, kafkaRecord },
      });
    }
  }

  // Send all transformed records for indexing
  await bulkUpdateDataWrapper(osDomain, index, docs);
};

const ksql = async (kafkaRecords: KafkaRecord[], topicPartition: string) => {
  const docs: any[] = [];
  for (const kafkaRecord of kafkaRecords) {
    const { key, value } = kafkaRecord;
    try {
      const id: string = JSON.parse(decodeBase64WithUtf8(key));

      // Handle deletes and continue
      if (!value) {
        docs.push(opensearch.main.seatool.tombstone(id));
        continue;
      }

      // Handle everything else and continue
      const record = {
        id,
        ...JSON.parse(decodeBase64WithUtf8(value)),
      };
      const result = opensearch.main.seatool.transform(id).safeParse(record);
      if (!result.success) {
        logError({
          type: ErrorType.VALIDATION,
          error: result?.error,
          metadata: { topicPartition, kafkaRecord, record },
        });
        continue;
      }
      if (
        result.data.authority &&
        typeof result.data.seatoolStatus === "string" &&
        result.data.seatoolStatus != "Unknown"
      ) {
        docs.push({ ...result.data });
      }
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

const changed_date = async (
  kafkaRecords: KafkaRecord[],
  topicPartition: string,
) => {
  const docs: any[] = [];
  for (const kafkaRecord of kafkaRecords) {
    const { value } = kafkaRecord;
    try {
      // Handle delete events and continue
      if (value === undefined) {
        continue;
      }

      // Parse record
      const decodedValue = Buffer.from(value, "base64").toString("utf-8");
      const record = JSON.parse(decodedValue).payload.after;

      // Handle tombstone events and continue
      if (!record) continue;

      const result = opensearch.main.changedDate.transform().safeParse(record);
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
