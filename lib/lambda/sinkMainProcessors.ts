import { bulkUpdateDataWrapper, ErrorType, logError, getItems } from "libs";
import { KafkaRecord, opensearch } from "shared-types";
import { transforms } from "shared-types/opensearch/main";
import { decodeBase64WithUtf8 } from "shared-utils";
import pino from "pino";

const logger = pino();

type TransformedEvent = {
  id: string;
  makoChangedDate: string | null;
};

const isRecordTransformable = (
  record: Partial<{
    event: string;
    origin: string;
  }>,
): record is { event: keyof typeof transforms } =>
  typeof record === "object" &&
  record?.event !== undefined &&
  record.event in transforms &&
  record?.origin === "mako";

const getTransformedEventFromRecord = (
  value: string,
  topicPartition: string,
  kafkaRecord: KafkaRecord,
): TransformedEvent | undefined => {
  const record = JSON.parse(decodeBase64WithUtf8(value));

  if (isRecordTransformable(record)) {
    const transformForEvent = transforms[record.event];

    const {
      data: transformedEvent,
      success,
      error,
    } = transformForEvent.transform().safeParse(record);

    if (success === false) {
      logError({
        type: ErrorType.VALIDATION,
        error,
        metadata: { topicPartition, kafkaRecord, record },
      });
    }

    logger.info(`event after transformation: ${JSON.stringify(transformedEvent, null, 2)}`);

    return transformedEvent;
  } else {
    logger.info(`No transform found for event: ${record.event}`);
  }

  return;
};

export const processAndIndex = async (kafkaRecords: KafkaRecord[], topicPartition: string) => {
  const recordsToUpdate = kafkaRecords.reduce<TransformedEvent[]>((acc, kafkaRecord) => {
    logger.info(`record: ${JSON.stringify(kafkaRecord, null, 2)}`);

    try {
      const { value } = kafkaRecord;

      if (!value) {
        return acc;
      }

      const transformedEvent = getTransformedEventFromRecord(value, topicPartition, kafkaRecord);

      if (transformedEvent) {
        return acc.concat(transformedEvent);
      }
    } catch (error) {
      logError({
        type: ErrorType.BADPARSE,
        error,
        metadata: { topicPartition, kafkaRecord },
      });
    }

    return acc;
  }, []);

  await bulkUpdateDataWrapper(recordsToUpdate, "main");
};

export const ksql = async (kafkaRecords: KafkaRecord[], topicPartition: string) => {
  const docs: any[] = [];

  // fetch the date for all kafkaRecords in the list from opensearch
  const ids = kafkaRecords.map((record) => {
    const decodedId = JSON.parse(decodeBase64WithUtf8(record.key));

    return decodedId;
  });

  const osDomain = process.env.osDomain;
  const indexNamespace = process.env.indexNamespace;
  if (!indexNamespace || !osDomain) {
    throw new Error("Missing required environment variable(s)");
  }

  const openSearchRecords = await getItems(osDomain, indexNamespace, ids);

  const existingRecordsLookup = openSearchRecords.reduce<Record<string, number>>((acc, item) => {
    const epochDate = new Date(item.changedDate).getTime(); // Convert `changedDate` to epoch number
    acc[item.id] = epochDate; // Use `id` as the key and epoch date as the value
    return acc;
  }, {});

  console.log("are we here 4");

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
      console.log("--------------------");
      console.log(`id: ${result.data.id}`);
      console.log(`mako: ` + existingRecordsLookup[result.data.id]);
      console.log(`seatool: ` + result.data.changed_date);
      if (
        existingRecordsLookup[result.data.id] && // Check if defined
        (!result.data.changed_date || // Check if not defined or...
          result.data.changed_date < existingRecordsLookup[result.data.id]) // ...less than existingRecordsLookup[result.data.id]
      ) {
        console.log(`SKIP`);
        continue;
      }
      console.log(`INDEX`);
      console.log("--------------------");

      if (
        result.data.authority &&
        typeof result.data.seatoolStatus === "string" &&
        result.data.seatoolStatus != "Unknown"
      ) {
        console.log("what status are we writing", JSON.stringify(result.data));
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
  await bulkUpdateDataWrapper(docs, "main");
};

export const changed_date = async (kafkaRecords: KafkaRecord[], topicPartition: string) => {
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
  await bulkUpdateDataWrapper(docs, "main");
};
