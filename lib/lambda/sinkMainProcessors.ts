import { bulkUpdateDataWrapper, ErrorType, logError, getItems } from "libs";
import { KafkaRecord, opensearch, SeatoolRecordWithUpdatedDate } from "shared-types";
import { Document, transforms } from "shared-types/opensearch/main";
import { decodeBase64WithUtf8 } from "shared-utils";
import { isBefore } from "date-fns";

const removeDoubleQuotesSurroundingString = (str: string) => str.replace(/^"|"$/g, "");

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

/**
 * Processes incoming new records from the OneMac user interface and adds them to Mako
 * @param kafkaRecords records to process
 * @param topicPartition kafka topic for verbose error handling
 */
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
  const kafkaIds = kafkaRecords.map((record) =>
    removeDoubleQuotesSurroundingString(decodeBase64WithUtf8(record.key)),
  );
  const openSearchRecords = await getItems(kafkaIds);

  return openSearchRecords.reduce<Map<string, number>>((map, item) => {
    if (item.changedDate !== null) {
      map.set(item.id, new Date(item.changedDate).getTime());
    }

    return map;
  }, new Map());
};

/**
 * Processes new SEATOOL records and reconciles them with existing Mako records
 * @param kafkaRecords records to process
 * @param topicPartition kafka topic for verbose error handling
 */
export const insertNewSeatoolRecordsFromKafkaIntoMako = async (
  kafkaRecords: KafkaRecord[],
  topicPartition: string,
) => {
  const makoDocTimestamps = await getMakoDocTimestamps(kafkaRecords);

  const seatoolRecordsForMako = kafkaRecords.reduce<{ id: string; [key: string]: unknown }[]>(
    (collection, kafkaRecord) => {
      try {
        const { key, value } = kafkaRecord;

        if (!key) {
          console.log(`Record without a key property: ${value}`);

          return collection;
        }

        const id: string = removeDoubleQuotesSurroundingString(decodeBase64WithUtf8(key));

        if (!value) {
          // record in seatool has been deleted
          // nulls the seatool properties from the record
          // seatool record would now only have mako properties
          console.log(`Record without a value property: ${value}`);
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
            error: safeSeatoolRecord.error.errors,
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

        const isOlderThanMako =
          seatoolDocument.changed_date &&
          makoDocumentTimestamp &&
          isBefore(seatoolDocument.changed_date, makoDocumentTimestamp);

        if (isOlderThanMako) {
          console.log("SKIPPED DUE TO OUT-OF-DATE INFORMATION");
          return collection;
        }

        if (seatoolDocument.authority && seatoolDocument.seatoolStatus !== "Unknown") {
          console.log("INDEX");
          console.log("--------------------");
          console.log(`Status: ${seatoolDocument.seatoolStatus}`);

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

/**
 * Syncs date updates in SEATOOL records with Mako, offloading processing from `insertNewSeatoolRecordsFromKafkaIntoMako`
 * @param kafkaRecords records with updated date payload
 * @param topicPartition kafka topic for verbose error handling
 */
export const syncSeatoolRecordDatesFromKafkaWithMako = async (
  kafkaRecords: KafkaRecord[],
  topicPartition: string,
) => {
  const recordIdsWithUpdatedDates = kafkaRecords.reduce<
    { id: string; changedDate: string | null }[]
  >((collection, kafkaRecord) => {
    const { value } = kafkaRecord;

    try {
      if (!value) {
        console.log(`Record without a value property: ${value}`);

        return collection;
      }

      const payloadWithUpdatedDate: { payload?: { after?: SeatoolRecordWithUpdatedDate | null } } =
        decodeBase64WithUtf8(value) as any;

      // .after could be `null` or `undefined`
      if (!payloadWithUpdatedDate?.payload?.after) {
        return collection;
      }

      const { after: recordWithUpdatedDate } = payloadWithUpdatedDate.payload;

      const safeRecordWithIdAndUpdatedDate = opensearch.main.changedDate
        .transform()
        .safeParse(recordWithUpdatedDate);

      if (safeRecordWithIdAndUpdatedDate.success === false) {
        logError({
          type: ErrorType.VALIDATION,
          error: safeRecordWithIdAndUpdatedDate.error.errors,
          metadata: { topicPartition, kafkaRecord, recordWithUpdatedDate },
        });

        return collection;
      }

      const { data: idAndUpdatedDate } = safeRecordWithIdAndUpdatedDate;

      return collection.concat(idAndUpdatedDate);
    } catch (error) {
      logError({
        type: ErrorType.BADPARSE,
        error,
        metadata: { topicPartition, kafkaRecord },
      });
    }

    return collection;
  }, []);

  await bulkUpdateDataWrapper(recordIdsWithUpdatedDates, "main");
};
