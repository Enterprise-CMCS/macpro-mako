import { UTCDate } from "@date-fns/utc";
import { isAfter, isBefore } from "date-fns";
import {
  bulkUpdateDataWrapper,
  ErrorType,
  getItems,
  logError,
  OutboundRecordInput,
  processOutboundEvents,
} from "libs";
import { getPackage, getPackageChangelog } from "libs/api/package";
import {
  KafkaRecord,
  opensearch,
  SEATOOL_SPW_STATUS,
  SEATOOL_STATUS,
  SeatoolRecordWithUpdatedDate,
  SeatoolSpwStatusEnum,
} from "shared-types";
import {
  onemacLegacyUserInformation,
  onemacLegacyUserRoleRequest,
  userInformation,
  userRoleRequest,
} from "shared-types/events/legacy-user";
import {
  Document,
  isSkippableError,
  legacyTransforms,
  seatool,
  transforms,
} from "shared-types/opensearch/main";
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
// Used for updating access for legacy user role events and request state access on mako
export const isRecordAUserRoleRequest = (
  record: OneMacRecord,
): record is OneMacRecord & { eventType: "user-role" | "legacy-user-role" } => {
  return (
    typeof record === "object" &&
    record !== null &&
    (record.eventType === "user-role" || record.eventType === "legacy-user-role")
  );
};
// Only used for ingesting legacy user role documents?
export const isRecordALegacyUserRoleRequest = (
  record: ParsedLegacyRecordFromKafka,
  kafkaSource: string,
): record is {
  componentType: keyof typeof legacyTransforms;
} =>
  typeof record === "object" &&
  record.sk !== undefined &&
  [
    "defaultcmsuser",
    "cmsroleapprover",
    "cmsreviewer",
    "statesystemadmin",
    "helpdesk",
    "statesubmitter",
  ].some((role) => record!.sk!.includes(role)) &&
  kafkaSource === "onemac";

export const isRecordALegacyUser = (
  record: ParsedLegacyRecordFromKafka,
  kafkaSource: string,
): record is {
  componentType: keyof typeof legacyTransforms;
} =>
  typeof record === "object" &&
  record.sk !== undefined &&
  record.sk === "ContactInfo" &&
  kafkaSource === "onemac";

export const isRecordAUser = (
  record: OneMacRecord,
): record is OneMacRecord & { eventType: "user-info" | "legacy-user-info" } =>
  typeof record === "object" &&
  record !== null &&
  (record.eventType === "user-info" || record.eventType === "legacy-user-info");

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
  const kafkaSource = String.fromCharCode(...(kafkaRecord.headers[0]?.source || []));

  // Skip email tracking events
  if (record.eventList && record.componentId) {
    console.log(`Skipping email event for component: ${record.componentId}`);
    return undefined; // Skip processing
  }

  if (isRecordAnAdminOneMacRecord(record)) {
    const safeRecord = adminRecordSchema.safeParse(record);

    if (safeRecord.success === false) {
      console.warn(`Skipping package with invalid format for type "${record.adminChangeType}"`);

      logError({
        type: ErrorType.VALIDATION,
        error: safeRecord.error.errors,
        metadata: { topicPartition, kafkaRecord, record },
      });

      return;
    }

    const { data: oneMacAdminRecord } = safeRecord;

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

    return oneMacRecord;
  }

  if (isRecordAUserRoleRequest(record)) {
    const userParseResult = userRoleRequest.safeParse(record);

    if (userParseResult.success === true) {
      console.log("USER RECORD: ", JSON.stringify(record));
      return userParseResult.data;
    }

    console.log("USER RECORD INVALID BECAUSE: ", userParseResult.error, JSON.stringify(record));
  }

  if (isRecordALegacyUserRoleRequest(record, kafkaSource)) {
    const userParseResult = onemacLegacyUserRoleRequest.safeParse({
      ...record,
      eventType: "legacy-user-role",
    });

    if (userParseResult.success === true) {
      console.log("USER RECORD: ", JSON.stringify(record));
      return userParseResult.data;
    }

    console.log("USER RECORD INVALID BECAUSE: ", userParseResult.error, JSON.stringify(record));
  }

  if (isRecordALegacyUser(record, kafkaSource)) {
    const userParseResult = onemacLegacyUserInformation.safeParse({
      ...record,
      eventType: "legacy-user-info",
    });

    if (userParseResult.success === true) {
      console.log("USER RECORD: ", JSON.stringify(record));
      return userParseResult.data;
    }
    console.log("USER RECORD INVALID BECAUSE: ", userParseResult.error, JSON.stringify(record));
  }

  if (isRecordAUser(record)) {
    const userParseResult = userInformation.safeParse(record);

    if (userParseResult.success === true) {
      console.log("USER RECORD: ", JSON.stringify(record));
      return userParseResult.data;
    }
    console.log("USER RECORD INVALID BECAUSE: ", userParseResult.error, JSON.stringify(record));
  }

  if (isRecordALegacyOneMacRecord(record, kafkaSource)) {
    const transformForLegacyEvent = legacyTransforms[record.componentType];

    const safeEvent = transformForLegacyEvent
      .transform()
      .transform((data) => ({ ...data, proposedEffectiveDate: null }))
      .safeParse(record);

    if (safeEvent.success === false) {
      logError({
        type: ErrorType.VALIDATION,
        error: safeEvent.error.errors,
        metadata: { topicPartition, kafkaRecord, record },
      });

      return;
    }

    const { data: oneMacLegacyRecord } = safeEvent;

    return oneMacLegacyRecord;
  }
  console.error(`No transform found for event: ${record.event}`, JSON.stringify(record));

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

  const oneMacRecords = oneMacRecordsForMako.filter(
    (record) =>
      record.eventType !== "user-info" &&
      record.eventType !== "legacy-user-role" &&
      record.eventType !== "legacy-user-info" &&
      record.eventType !== "user-role",
  );
  const oneMacUsers = oneMacRecordsForMako.filter(
    (record) => record.eventType === "user-info" || record.eventType === "legacy-user-info",
  );
  const roleRequests = oneMacRecordsForMako
    .filter((record) => record.eventType === "legacy-user-role" || record.eventType === "user-role")
    .sort((a, b) => {
      return (a.lastModifiedDate as any) - (b.lastModifiedDate as any);
    });

  await bulkUpdateDataWrapper(oneMacRecords, "main");
  await bulkUpdateDataWrapper(oneMacUsers, "users");
  await bulkUpdateDataWrapper(roleRequests, "roles");

  // Process outbound events for SMART integration (if configured)
  // Only process package records, not user/role records
  if (oneMacRecords.length > 0) {
    try {
      const outboundRecords: OutboundRecordInput[] = oneMacRecords.map((record) => ({
        ...record,
        id: record.id,
        authority: record.authority as string | undefined,
        event: record.event as string | undefined,
        eventType: record.eventType as string | undefined,
      }));

      await processOutboundEvents(outboundRecords);
    } catch (error) {
      // Log but don't fail the main processing if outbound events fail
      logError({
        type: ErrorType.UNKNOWN,
        error,
        metadata: { context: "processOutboundEvents", recordCount: oneMacRecords.length },
      });
      console.error("Failed to process outbound events:", error);
    }
  }
};

const getMakoDocTimestamps = async (kafkaRecords: KafkaRecord[]) => {
  const kafkaIds = kafkaRecords.map((record) =>
    removeDoubleQuotesSurroundingString(decodeBase64WithUtf8(record.key)),
  );
  const openSearchRecords = await getItems(kafkaIds);

  return openSearchRecords.reduce<
    Map<string, { changedDate?: number; raiReceivedDate?: number; raiWithdrawnDate?: number }>
  >((map, item) => {
    map.set(item.id, {
      changedDate: item.changedDate ? new Date(item.changedDate).getTime() : undefined,
      raiReceivedDate: item.raiReceivedDate ? new Date(item.raiReceivedDate).getTime() : undefined,
      raiWithdrawnDate: item.raiWithdrawnDate
        ? new Date(item.raiWithdrawnDate).getTime()
        : undefined,
    });

    return map;
  }, new Map());
};
//  We need to make sure if we have a certain status in onemac that it takes priority over what comes over from seatool.
//  Withdrawl-requested,RAI response withdrawal requested and if we responded to an rai request take priority
export const oneMacSeatoolStatusCheck = async (seatoolRecord: Document) => {
  const existingPackage = await getPackage(seatoolRecord.id);

  const oneMacStatus = existingPackage?._source?.seatoolStatus;
  const seatoolStatus = seatoolRecord?.STATE_PLAN.SPW_STATUS_ID;

  // if the OneMAC status is Withdrawal Requested
  if (oneMacStatus === SEATOOL_STATUS.WITHDRAW_REQUESTED) {
    // and the SEA Tool status is Withdrawn, return Withdrawn
    if (seatoolStatus === SeatoolSpwStatusEnum.Withdrawn) {
      return seatoolStatus;
    }
    // otherwise, return Withdrawal Requested
    return SeatoolSpwStatusEnum.WithdrawalRequested;
  }

  // if the OneMAC status is Submitted
  if (oneMacStatus === SEATOOL_STATUS.SUBMITTED) {
    // check to see if any of the Changelog events are Respond-to-RAI
    const changelogs = await getPackageChangelog(seatoolRecord.id);
    const raiResponseEvents = changelogs.hits.hits.filter(
      (event) => event._source.event === "respond-to-rai",
    );

    // if there are no RAI responses, return the current status in SEA Tool
    if (!raiResponseEvents || raiResponseEvents.length === 0) {
      return seatoolStatus;
    }

    // if the SEA Tool status is Pending, return Pending
    if (seatoolStatus === SeatoolSpwStatusEnum.Pending) {
      return seatoolStatus;
    }

    // if the SEA Tool status is Pending RAI, more checks are needed
    if (seatoolStatus === SeatoolSpwStatusEnum.PendingRAI) {
      // get the most recent RAI response from the Changelog in OneMAC,
      // there could be multiple responses and multiple RAIs
      const mostRecentRaiResponse = raiResponseEvents?.at(-1);

      // get the RAI dates from the SEA Tool record
      const raiDate = seatool.getRaiDate(seatoolRecord);
      // only proceed if we have a RAI response in OneMAC and a RAI requested date in SEA Tool
      if (mostRecentRaiResponse && raiDate.raiRequestedDate) {
        // convert these values to UTC so that they are being compared without worrying about timezones
        const eventDate = new UTCDate(mostRecentRaiResponse._source.timestamp);
        const requestedDate = new UTCDate(raiDate.raiRequestedDate);
        // When a note is added or save to a RAI request, it presents as a new RAI request,
        // even if the RAI response has already been submitted and is pending review.
        // We don't want to change the OneMAC status to Pending RAI though because it has
        // already been responded to, so we will leave the status as Submitted.
        if (isAfter(eventDate, requestedDate)) {
          return SeatoolSpwStatusEnum.Submitted;
        }
      }
      // if there are no RAI Responses in OneMAC or no RAI requested date in SEA Tool
      // or if the RAI requested date in SEA Tool is after the RAI Response in OneMAC
      // return the current SEA Tool Status
      return seatoolStatus;
    }

    // if the SEA Tool status is Disapproved, return Disapproved
    if (seatoolStatus === SeatoolSpwStatusEnum.Disapproved) {
      return seatoolStatus;
    }

    // if the SEA Tool status didn't match any of the above, return the current SEA Tool status
    return seatoolStatus;
  }

  // if the OneMAC status is RAI Response Withdrawal Requested
  if (oneMacStatus === SEATOOL_STATUS.RAI_RESPONSE_WITHDRAW_REQUESTED) {
    // if the SEA Tool status is Pending RAI, return Pending RAI
    if (seatoolStatus === SeatoolSpwStatusEnum.PendingRAI) {
      return seatoolStatus;
    }

    // if the SEA Tool status is terminating, then return the current SEA Tool status
    if (
      seatoolStatus &&
      [
        SeatoolSpwStatusEnum.Withdrawn,
        SeatoolSpwStatusEnum.Terminated,
        SeatoolSpwStatusEnum.Disapproved,
      ].includes(seatoolStatus)
    ) {
      return seatoolStatus;
    }

    // otherwise return Formal RAI Response - Withdrawal Requested
    return SeatoolSpwStatusEnum.FormalRAIResponseWithdrawalRequested;
  }

  // if none of the OneMAC statuses match the above, return the current SEA Tool status
  return seatoolStatus;
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
  const seatoolRecordsForMako: { id: string; [key: string]: unknown }[] = [];

  for (const kafkaRecord of kafkaRecords) {
    try {
      const { key, value } = kafkaRecord;

      if (!key) {
        console.error(`Record without a key property: ${value}`);
        continue;
      }

      const id: string = removeDoubleQuotesSurroundingString(decodeBase64WithUtf8(key));

      if (!value) {
        console.error(`Record without a value property: ${value}`);
        continue;
      }

      const seatoolRecord: Document = {
        id,
        ...JSON.parse(decodeBase64WithUtf8(value)),
      };

      seatoolRecord.STATE_PLAN.SPW_STATUS_ID = await oneMacSeatoolStatusCheck(seatoolRecord);

      let safeSeatoolRecord;
      try {
        safeSeatoolRecord = opensearch.main.seatool.transform(id).safeParse(seatoolRecord);
      } catch (error) {
        if (isSkippableError(error)) {
          console.warn(`Skipping record ${id} due to validation error: ${error.message}`);
          logError({
            type: ErrorType.VALIDATION,
            error: error.message,
            metadata: {
              topicPartition,
              kafkaRecord,
              record: seatoolRecord,
              skipReason: "validation_error",
              errorMetadata: error.metadata,
            },
          });
          continue;
        }
        // Re-throw errors that should cause the process to fail
        throw error;
      }

      if (!safeSeatoolRecord.success) {
        logError({
          type: ErrorType.VALIDATION,
          error: safeSeatoolRecord.error.errors,
          metadata: { topicPartition, kafkaRecord, record: seatoolRecord },
        });
        continue;
      }

      const { data: seatoolDocument } = safeSeatoolRecord;
      const makoDocumentTimestamps = makoDocTimestamps.get(seatoolDocument.id);

      if (
        seatoolDocument.changed_date &&
        makoDocumentTimestamps &&
        makoDocumentTimestamps?.changedDate &&
        isBefore(seatoolDocument.changed_date, makoDocumentTimestamps.changedDate)
      ) {
        console.warn(
          `id: ${seatoolDocument.id} mako: ${makoDocumentTimestamps.changedDate} seatool: ${seatoolDocument.changed_date} ${seatoolDocument.cmsStatus}`,
        );
        console.warn("SKIPPED DUE TO OUT-OF-DATE INFORMATION");
        continue;
      }

      // Overwrite the RAI received date with the OneMAC value,
      // unless the RAI received date in SEA Tool is undefined
      // which indicates that a new RAI has been requested
      // and the OneMAC RAI received date should be reset to undefined
      if (
        seatoolDocument.raiReceivedDate !== undefined &&
        makoDocumentTimestamps?.raiReceivedDate
      ) {
        seatoolDocument.raiReceivedDate = new Date(
          makoDocumentTimestamps.raiReceivedDate,
        ).toISOString();
      }

      if (
        seatoolDocument.raiWithdrawnDate !== undefined &&
        makoDocumentTimestamps?.raiWithdrawnDate
      ) {
        // Overwrite the RAI withdrawn date with the OneMAC value,
        // unless the RAI withdrawn date in SEA Tool is undefined
        // which indicates that a new RAI has been requested
        // and the OneMAC RAI withdrawn date should be reset to undefined
        seatoolDocument.raiWithdrawnDate = new Date(
          makoDocumentTimestamps.raiWithdrawnDate,
        ).toISOString();
      }

      if (seatoolDocument.seatoolStatus === SEATOOL_SPW_STATUS[SeatoolSpwStatusEnum.PendingRAI]) {
        seatoolDocument.raiReceivedDate = null;
        seatoolDocument.raiWithdrawnDate = null;
      }

      if (
        seatoolDocument.seatoolStatus ===
        SEATOOL_SPW_STATUS[SeatoolSpwStatusEnum.FormalRAIResponseWithdrawalRequested]
      ) {
        seatoolDocument.raiReceivedDate = null;
      }

      if (seatoolDocument.authority && seatoolDocument.seatoolStatus !== "Unknown") {
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
        console.error(`Record without a value property: ${value}`);

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

    return collection;
  }, []);
  await bulkUpdateDataWrapper(recordIdsWithUpdatedDates, "main");
};
