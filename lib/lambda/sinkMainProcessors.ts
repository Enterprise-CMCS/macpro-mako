import { bulkUpdateDataWrapper, ErrorType, logError, getItems } from "libs";
import { KafkaRecord, opensearch } from "shared-types";
import { transforms, Document } from "shared-types/opensearch/main";
import { decodeBase64WithUtf8 } from "shared-utils";
import { isBefore } from "date-fns";

type OneMacRecord = {
  id: string;
  makoChangedDate: string | null;
};

const isRecordAOneMacRecord = (
  record: Partial<{
    event: string;
    origin: string;
  }>,
): record is { event: keyof typeof transforms } =>
  typeof record === "object" &&
  record?.event !== undefined &&
  record.event in transforms &&
  record?.origin === "mako";

const getOneMacRecordWithAllProperties = (
  value: string,
  topicPartition: string,
  kafkaRecord: KafkaRecord,
): OneMacRecord | undefined => {
  const record = JSON.parse(decodeBase64WithUtf8(value));

  if (isRecordAOneMacRecord(record)) {
    const transformForEvent = transforms[record.event];

    const safeEvent = transformForEvent.transform().safeParse(record);

    if (safeEvent.success === false) {
      logError({
        type: ErrorType.VALIDATION,
        error: safeEvent.error,
        metadata: { topicPartition, kafkaRecord, record },
      });

      return;
    }

    const { data: oneMacRecord } = safeEvent;

    console.log(`event after transformation: ${JSON.stringify(oneMacRecord, null, 2)}`);

    return oneMacRecord;
  } else {
    console.log(`No transform found for event: ${record.event}`);
  }

  return;
};

export const insertOneMacRecordsFromKafkaIntoMako = async (
  kafkaRecords: KafkaRecord[],
  topicPartition: string,
) => {
  const oneMacRecordsForMako = kafkaRecords.reduce<OneMacRecord[]>((collection, kafkaRecord) => {
    console.log(`record: ${JSON.stringify(kafkaRecord, null, 2)}`);

    try {
      const { value } = kafkaRecord;

      if (!value) {
        return collection;
      }

      const oneMacRecordWithAllProperties = getOneMacRecordWithAllProperties(
        value,
        topicPartition,
        kafkaRecord,
      );

      if (oneMacRecordWithAllProperties) {
        return collection.concat(oneMacRecordWithAllProperties);
      }
    } catch (error) {
      logError({
        type: ErrorType.BADPARSE,
        error,
        metadata: { topicPartition, kafkaRecord },
      });
    }

    return collection;
  }, []);

  await bulkUpdateDataWrapper(oneMacRecordsForMako, "main");
};

const getMakoDocTimestamps = async (kafkaRecords: KafkaRecord[]) => {
  const kafkaIds = kafkaRecords.map((record) => JSON.parse(decodeBase64WithUtf8(record.key)));
  const openSearchRecords = await getItems(kafkaIds);

  return openSearchRecords.reduce<Map<string, number>>((map, item) => {
    map.set(item.id, new Date(item.changedDate).getTime());

    return map;
  }, new Map());
};

export const insertNewSeatoolRecordsFromKafkaIntoMako = async (
  kafkaRecords: KafkaRecord[],
  topicPartition: string,
) => {
  const makoDocTimestamps = await getMakoDocTimestamps(kafkaRecords);

  const seatoolRecordsForMako = kafkaRecords.reduce<{ id: string; [key: string]: unknown }[]>(
    (collection, kafkaRecord) => {
      try {
        const { key, value } = kafkaRecord;

        const id: string = decodeBase64WithUtf8(key);

        if (!value) {
          // record in seatool has been deleted
          // nulls the seatool properties from the record
          // seatool record would now only have mako properties
          return collection.concat(opensearch.main.seatool.tombstone(id));
        }

        const seatoolRecord: Document = {
          id,
          ...JSON.parse(decodeBase64WithUtf8(value)),
        };

        const safeSeatoolRecord = opensearch.main.seatool.transform(id).safeParse(seatoolRecord);

        if (safeSeatoolRecord.success === false) {
          logError({
            type: ErrorType.VALIDATION,
            error: safeSeatoolRecord.error,
            metadata: { topicPartition, kafkaRecord, record: seatoolRecord },
          });

          return collection;
        }

        const { data: seatoolDocument } = safeSeatoolRecord;
        const makoDocumentTimestamp = makoDocTimestamps.get(seatoolDocument.id);

        console.log("--------------------");
        console.log(`id: ${seatoolDocument.id}`);
        console.log(`mako: ${makoDocumentTimestamp}`);
        console.log(`seatool: ${seatoolDocument.changed_date}`);

        const isNewerOrUndefined =
          seatoolDocument.changed_date &&
          makoDocumentTimestamp &&
          isBefore(seatoolDocument.changed_date, makoDocumentTimestamp);

        if (isNewerOrUndefined) {
          console.log("SKIPPED DUE TO OUT-OF-DATE INFORMATION");
          return collection;
        }

        console.log("INDEX");
        console.log("--------------------");

        if (seatoolDocument.authority && seatoolDocument.seatoolStatus !== "Unknown") {
          console.log(`Status: ${seatoolDocument}`);

          return collection.concat({ ...seatoolDocument });
        }
      } catch (error) {
        logError({
          type: ErrorType.BADPARSE,
          error,
          metadata: { topicPartition, kafkaRecord },
        });
      }

      return collection;
    },
    [],
  );

  await bulkUpdateDataWrapper(seatoolRecordsForMako, "main");
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
