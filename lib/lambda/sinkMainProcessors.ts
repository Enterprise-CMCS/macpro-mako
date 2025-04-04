import { isBefore } from "date-fns";
import { bulkUpdateDataWrapper, ErrorType, getItems, logError } from "libs";
import { getPackage, getPackageChangelog } from "libs/api/package";
import {
  KafkaRecord,
  opensearch,
  SEATOOL_STATUS,
  SeatoolRecordWithUpdatedDate,
} from "shared-types";
import { Document, legacyTransforms, transforms } from "shared-types/opensearch/main";
import { decodeBase64WithUtf8 } from "shared-utils";

import {
  deleteAdminChangeSchema,
  extendSubmitNOSOAdminSchema,
  splitSPAAdminChangeSchema,
  updateIdAdminChangeSchema,
  updateValuesAdminChangeSchema,
} from "./update/adminChangeSchemas";

const removeDoubleQuotesSurroundingString = (str: string) => str.replace(/^"|"$/g, "");
const adminRecordSchema = deleteAdminChangeSchema
  .or(updateValuesAdminChangeSchema)
  .or(updateIdAdminChangeSchema)
  .or(splitSPAAdminChangeSchema)
  .or(extendSubmitNOSOAdminSchema);

type OneMacRecord = {
  id: string;
  [key: string]: unknown | undefined;
};

type ParsedRecordFromKafka = Partial<{
  event: string;
  origin: string;
  isAdminChange: boolean;
  adminChangeType: string;
}>;

type ParsedLegacyRecordFromKafka = Partial<{
  componentType: string;
  sk: string;
  GSI1pk: string;
}>;

export const isRecordALegacyOneMacRecord = (
  record: ParsedLegacyRecordFromKafka,
  kafkaSource: string,
): record is {
  componentType: keyof typeof legacyTransforms;
} =>
  typeof record === "object" &&
  record?.componentType !== undefined &&
  record.componentType in legacyTransforms &&
  record.sk === "Package" &&
  record.GSI1pk !== undefined &&
  (record.GSI1pk === "OneMAC#spa" || record.GSI1pk === "OneMAC#waiver") &&
  kafkaSource === "onemac";

const isRecordAOneMacRecord = (
  record: ParsedRecordFromKafka,
): record is { event: keyof typeof transforms } =>
  typeof record === "object" &&
  record?.event !== undefined &&
  record.event in transforms &&
  record?.origin === "mako";

const isRecordAnAdminOneMacRecord = (
  record: ParsedRecordFromKafka,
): record is { adminChangeType: string; isAdminChange: boolean } =>
  typeof record === "object" &&
  record?.isAdminChange === true &&
  record?.adminChangeType !== undefined;

const getOneMacRecordWithAllProperties = (
  value: string,
  topicPartition: string,
  kafkaRecord: KafkaRecord,
): OneMacRecord | undefined => {
  const record = JSON.parse(decodeBase64WithUtf8(value));
  console.log(`kafkaRecord: ${JSON.stringify(kafkaRecord, null, 2)}`);
  const kafkaSource = String.fromCharCode(...(kafkaRecord.headers[0]?.source || []));

  if (isRecordAnAdminOneMacRecord(record)) {
    const safeRecord = adminRecordSchema.safeParse(record);

    if (safeRecord.success === false) {
      console.log(`Skipping package with invalid format for type "${record.adminChangeType}"`);

      logError({
        type: ErrorType.VALIDATION,
        error: safeRecord.error.errors,
        metadata: { topicPartition, kafkaRecord, record },
      });

      return;
    }

    const { data: oneMacAdminRecord } = safeRecord;

    console.log(`admin record: ${JSON.stringify(oneMacAdminRecord, null, 2)}`);

    return oneMacAdminRecord;
  }

  if (isRecordAOneMacRecord(record)) {
    const transformForEvent = transforms[record.event];

    const safeEvent = transformForEvent.transform().safeParse(record);

    if (safeEvent.success === false) {
      logError({
        type: ErrorType.VALIDATION,
        error: safeEvent.error.errors,
        metadata: { topicPartition, kafkaRecord, record },
      });

      return;
    }

    const { data: oneMacRecord } = safeEvent;

    console.log(`event after transformation: ${JSON.stringify(oneMacRecord, null, 2)}`);

    return oneMacRecord;
  }

  if (isRecordALegacyOneMacRecord(record, kafkaSource)) {
    console.log(`legacy event: ${JSON.stringify(record, null, 2)}`);
    const transformForLegacyEvent = legacyTransforms[record.componentType];

    const safeEvent = transformForLegacyEvent
      .transform()
      .transform((data) => ({ ...data, proposedEffectiveDate: null }))
      .safeParse(record);

    console.log(`safeEvent: ${JSON.stringify(safeEvent, null, 2)}`);
    if (safeEvent.success === false) {
      logError({
        type: ErrorType.VALIDATION,
        error: safeEvent.error.errors,
        metadata: { topicPartition, kafkaRecord, record },
      });

      return;
    }

    const { data: oneMacLegacyRecord } = safeEvent;

    console.log(
      `legacy event after transformation: ${JSON.stringify(oneMacLegacyRecord, null, 2)}`,
    );

    return oneMacLegacyRecord;
  }

  console.log(`No transform found for event: ${record.event}`);

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
    console.log(
      `kafka record in insertOneMacRecordsFromKafkaIntoMako: ${JSON.stringify(kafkaRecord, null, 2)}`,
    );

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
    if (item?.changedDate) {
      map.set(item.id, new Date(item.changedDate).getTime());
    }

    return map;
  }, new Map());
};
//  We need to make sure if we have a certain status in onemac that it takes priority over what comes over from seatool.
//  Withdrawl-requested,RAI response withdrawal requested and if we responded to an rai request take priority
const oneMacSeatoolStatusCheck = async (seatoolRecord: Document) => {
  const existingPackage = await getPackage(seatoolRecord.id);

  const oneMacStatus = existingPackage?._source?.seatoolStatus;
  const seatoolStatus = seatoolRecord?.STATE_PLAN.SPW_STATUS_ID;

  // If we have a withdrawal requested do not update unless the status in seatool is Withdrawn
  if (oneMacStatus === SEATOOL_STATUS.WITHDRAW_REQUESTED && seatoolStatus !== 6) {
    return 12;
  }
  // OneMac is requesting an RAI withdrawal it is not Pending RAI in seatool
  if (oneMacStatus === SEATOOL_STATUS.RAI_RESPONSE_WITHDRAW_REQUESTED && seatoolStatus !== 2) {
    return 13;
  }
  // Current status is RAI Issued in seatool and onemac status is SUBMITTED
  if (seatoolStatus === 2 && oneMacStatus === SEATOOL_STATUS.SUBMITTED) {
    // Checking to see if the most recent entry is in the changelog is respond to rai
    const changelogs = await getPackageChangelog(seatoolRecord.id);

    console.log("changelogs: " + changelogs);
    const raiResponseEvents = changelogs.hits.hits.filter(
      (event) => event._source.event === "respond-to-rai",
    );
    console.log("rai events");
    console.log(raiResponseEvents);
    console.log("seatool requested date: " + seatoolRecord.raiRequestedDate);
    console.log("response legnth " + raiResponseEvents?.length);
    // Only proceed if we have events and a RAI requested date
    if (raiResponseEvents?.length && seatoolRecord.raiRequestedDate) {
      console.log("hi");
      const eventDate = normalizeToDate(raiResponseEvents[0]._source.timestamp);
      const requestedDate = normalizeToDate(seatoolRecord.raiRequestedDate);
      console.log("event date: " + eventDate);
      console.log("request date: " + requestedDate);
      // Set status to submitted if our dates line up
      if (eventDate >= requestedDate) {
        seatoolRecord.STATE_PLAN.SPW_STATUS_ID = 14;
      }
    }
  }
  return seatoolRecord.STATE_PLAN.SPW_STATUS_ID;
};
// Seatool sets their days to a fixed time so we just round it to the day.
function normalizeToDate(timestamp: string | number | Date): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}
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
  const seatoolRecordsForMako: { id: string; [key: string]: unknown }[] = [];

  for (const kafkaRecord of kafkaRecords) {
    try {
      const { key, value } = kafkaRecord;

      if (!key) {
        console.log(`Record without a key property: ${value}`);
        continue;
      }

      const id: string = removeDoubleQuotesSurroundingString(decodeBase64WithUtf8(key));

      if (!value) {
        console.log(`Record without a value property: ${value}`);
        seatoolRecordsForMako.push(opensearch.main.seatool.tombstone(id));
        continue;
      }

      const seatoolRecord: Document = {
        id,
        ...JSON.parse(decodeBase64WithUtf8(value)),
      };

      seatoolRecord.STATE_PLAN.SPW_STATUS_ID = await oneMacSeatoolStatusCheck(seatoolRecord);

      const safeSeatoolRecord = opensearch.main.seatool.transform(id).safeParse(seatoolRecord);

      if (!safeSeatoolRecord.success) {
        logError({
          type: ErrorType.VALIDATION,
          error: safeSeatoolRecord.error.errors,
          metadata: { topicPartition, kafkaRecord, record: seatoolRecord },
        });
        continue;
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
        isBefore(makoDocumentTimestamp, seatoolDocument.changed_date);

      if (isNewerOrUndefined) {
        console.log("SKIPPED DUE TO OUT-OF-DATE INFORMATION");
        continue;
      }

      if (seatoolDocument.authority && seatoolDocument.seatoolStatus !== "Unknown") {
        console.log("INDEX");
        console.log("--------------------");
        console.log(`Status: ${seatoolDocument.seatoolStatus}`);

        seatoolRecordsForMako.push(seatoolDocument);
      }
    } catch (error) {
      logError({
        type: ErrorType.BADPARSE,
        error,
        metadata: { topicPartition, kafkaRecord },
      });
    }
  }

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
        JSON.parse(decodeBase64WithUtf8(value));

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
    console.log("collection from seatool");
    console.log(collection);
    return collection;
  }, []);
  console.log(recordIdsWithUpdatedDates);
  await bulkUpdateDataWrapper(recordIdsWithUpdatedDates, "main");
};
