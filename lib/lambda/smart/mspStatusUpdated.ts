import * as os from "libs/opensearch-lib";
import { getDomainAndNamespace } from "libs/utils";
import { finalDispositionStatuses, getStatus, opensearch, SEATOOL_STATUS } from "shared-types";
import { z } from "zod";

import { SmartOnemacEventContext } from "./evaluateSmartPackageExistence";
import { transformMspManualRecordCreated } from "./mspManualRecordCreated";
import {
  calendarDate,
  getTimestampInMilliseconds,
  isoDateTime,
  latestIsoDate,
  normalizeSmartDate,
  reportSmartValidationFailure,
  requiredString,
  resolveSmartPackage,
  smartDate,
} from "./smartEventHelpers";
import { mapSmartStatus, SMART_STATUS_VALUES } from "./smartStatus";

const smartTypeSelectionSchema = z.object({
  typeSelectionId: requiredString,
  type: requiredString,
  subType: requiredString,
  isTypeActive: z.boolean(),
  isSubTypeActive: z.boolean(),
});

const smartRaiSchema = z
  .object({
    formalRaiRequested: z.boolean(),
    raiRequestedDate: smartDate.nullish(),
    raiResponseReceivedDate: smartDate.nullish(),
    raiResponseWithdrawnDate: smartDate.nullish(),
  })
  .passthrough();

const smartStatusUpdatedSchema = z
  .object({
    authority: z.literal("Medicaid SPA"),
    correlationId: z.string().trim(),
    createdAt: isoDateTime,
    description: z.string().nullish(),
    id: requiredString,
    operationType: z.literal("MSP_STATUS_UPDATED"),
    origin: z.literal("SMART"),
    rai: smartRaiSchema.nullish(),
    spaWaiverId: requiredString,
    status: z.enum(SMART_STATUS_VALUES),
    statusChangedAt: isoDateTime,
    statusDate: calendarDate,
    subject: z.string().nullish(),
    typeSelections: z.array(smartTypeSelectionSchema).nullish(),
  })
  .passthrough();

type SmartStatusUpdatedEvent = z.infer<typeof smartStatusUpdatedSchema>;

const hasOwn = (value: object, field: string): boolean =>
  Object.prototype.hasOwnProperty.call(value, field);

const normalizeOptionalDate = (value: string | null | undefined): string | undefined =>
  value == null ? undefined : normalizeSmartDate(value);

// OneMAC's legacy OpenSearch mapping requires numeric type IDs. SMART's IDs are
// Salesforce strings, while the UI only uses these values as stable list keys.
const numericTypeId = (value: string): number => {
  let hash = 2166136261;
  for (const character of value) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  }
  return hash >>> 0 || 1;
};

const getTypeUpdates = (event: SmartStatusUpdatedEvent): Record<string, unknown> | undefined => {
  if (!hasOwn(event, "typeSelections") || event.typeSelections == null) return undefined;

  const activeTypes = new Map<string, { SPA_TYPE_ID: number; SPA_TYPE_NAME: string }>();
  const activeSubTypes = new Map<string, { TYPE_ID: number; TYPE_NAME: string }>();
  for (const selection of event.typeSelections) {
    if (selection.isTypeActive && !activeTypes.has(selection.type)) {
      activeTypes.set(selection.type, {
        SPA_TYPE_ID: numericTypeId(selection.type),
        SPA_TYPE_NAME: selection.type,
      });
    }
    if (selection.isTypeActive && selection.isSubTypeActive) {
      activeSubTypes.set(selection.typeSelectionId, {
        TYPE_ID: numericTypeId(selection.typeSelectionId),
        TYPE_NAME: selection.subType,
      });
    }
  }

  return { types: [...activeTypes.values()], subTypes: [...activeSubTypes.values()] };
};

const getRaiUpdates = (
  event: SmartStatusUpdatedEvent,
  seatoolStatus: string,
): Record<string, unknown> => {
  const updates: Record<string, unknown> = {};
  const rai = event.rai;

  // SMART nulls are snapshots with an absent value, not delete commands. Preserve
  // OneMAC dates unless SMART provides a concrete replacement.
  if (rai) {
    const raiRequestedDate = normalizeOptionalDate(rai.raiRequestedDate);
    const raiReceivedDate = normalizeOptionalDate(rai.raiResponseReceivedDate);
    const raiWithdrawnDate = normalizeOptionalDate(rai.raiResponseWithdrawnDate);
    if (raiRequestedDate) updates.raiRequestedDate = raiRequestedDate;
    if (raiReceivedDate) updates.raiReceivedDate = raiReceivedDate;
    if (raiWithdrawnDate) updates.raiWithdrawnDate = raiWithdrawnDate;
  }

  // This is the legacy SEATool exception: a newly issued Formal RAI must not
  // inherit response dates from the previous RAI, or the State response action
  // would be hidden.
  if (seatoolStatus === SEATOOL_STATUS.PENDING_RAI) {
    updates.raiReceivedDate = null;
    updates.raiWithdrawnDate = null;
    updates.raiWithdrawEnabled = false;
  }

  return updates;
};

const getSecondClock = (
  document: opensearch.main.Document,
  updates: Record<string, unknown>,
  explicitSecondClock: boolean | undefined,
): boolean => {
  if (explicitSecondClock !== undefined) return explicitSecondClock;

  const raiRequestedDate = updates.raiRequestedDate ?? document.raiRequestedDate;
  const raiReceivedDate = updates.raiReceivedDate ?? document.raiReceivedDate;
  return Boolean(raiRequestedDate && raiReceivedDate);
};

const buildStatusUpdates = (
  event: SmartStatusUpdatedEvent,
  document: opensearch.main.Document,
): Record<string, unknown> => {
  const statusMapping = mapSmartStatus(event.status);
  if (!statusMapping) throw new Error(`Unsupported SMART status: ${event.status}`);

  const { seatoolStatus } = statusMapping;
  const statusChangedAt = new Date(event.statusChangedAt).toISOString();
  const normalizedStatusDate = normalizeSmartDate(event.statusDate);
  const { cmsStatus, stateStatus } = getStatus(seatoolStatus);
  const raiUpdates = getRaiUpdates(event, seatoolStatus);
  const typeUpdates = getTypeUpdates(event);
  const isFinalDisposition = finalDispositionStatuses.includes(seatoolStatus);

  return {
    seatoolStatus,
    cmsStatus,
    stateStatus,
    smartStatus: event.status,
    smartStatusChangedAt: statusChangedAt,
    statusDate: normalizedStatusDate,
    finalDispositionDate: isFinalDisposition ? normalizedStatusDate : null,
    initialIntakeNeeded: seatoolStatus === SEATOOL_STATUS.SUBMITTED,
    locked: false,
    secondClock: getSecondClock(document, raiUpdates, statusMapping.secondClock),
    makoChangedDate: latestIsoDate(document.makoChangedDate, statusChangedAt),
    changedDate: latestIsoDate(document.changedDate, statusChangedAt),
    operationType: event.operationType,
    ...raiUpdates,
    ...(isFinalDisposition ? { raiWithdrawEnabled: false } : {}),
    ...(hasOwn(event, "subject") ? { subject: event.subject ?? null } : {}),
    ...(hasOwn(event, "description") ? { description: event.description ?? null } : {}),
    ...(typeUpdates ?? {}),
    ...(!document.spaWaiverId ? { spaWaiverId: event.spaWaiverId } : {}),
    ...(!document.correlationId && event.correlationId
      ? { correlationId: event.correlationId }
      : {}),
  };
};

const createStatusReservation = async (
  context: SmartOnemacEventContext,
  event: SmartStatusUpdatedEvent,
): Promise<Error | undefined> => {
  const baseDocument = transformMspManualRecordCreated(context.event);
  if (!baseDocument) return new Error("package ID does not start with a known state code");
  const {
    approvedEffectiveDate: _approvedEffectiveDate,
    description: _description,
    proposedDate: _proposedDate,
    subject: _subject,
    ...statusReservation
  } = baseDocument;

  const document = {
    ...statusReservation,
    ...buildStatusUpdates(event, statusReservation as unknown as opensearch.main.Document),
  };
  const { domain, index } = getDomainAndNamespace("main");
  const result = await os.createItem(domain, index, document);
  if (result.created) return undefined;

  const racedPackage = await os.getItem(domain, index, event.id.toUpperCase());
  if (
    !racedPackage?._source ||
    (racedPackage._source.spaWaiverId && racedPackage._source.spaWaiverId !== event.spaWaiverId)
  ) {
    return new Error("package ID was claimed by another record during processing");
  }

  await os.updateItem(
    domain,
    index,
    racedPackage._id,
    buildStatusUpdates(event, racedPackage._source),
  );
  return undefined;
};

export const handleMspStatusUpdated = async (context: SmartOnemacEventContext): Promise<void> => {
  const parsedEvent = smartStatusUpdatedSchema.safeParse(context.event);
  if (!parsedEvent.success) {
    await reportSmartValidationFailure(context, parsedEvent.error);
    return;
  }
  const event = parsedEvent.data;
  const resolution = resolveSmartPackage(context);
  if (resolution instanceof Error) {
    await reportSmartValidationFailure(context, resolution);
    return;
  }

  if (!resolution) {
    const createError = await createStatusReservation(context, event);
    if (createError) await reportSmartValidationFailure(context, createError);
    return;
  }

  if (resolution.document.deleted === true || resolution.document.authority !== event.authority) {
    await reportSmartValidationFailure(
      context,
      new Error("status update requires a non-deleted package with matching authority"),
    );
    return;
  }

  const incomingTimestamp = Date.parse(event.statusChangedAt);
  const storedTimestamp = getTimestampInMilliseconds(resolution.document.smartStatusChangedAt);
  if (
    storedTimestamp === incomingTimestamp &&
    resolution.document.smartStatus &&
    resolution.document.smartStatus !== event.status
  ) {
    await reportSmartValidationFailure(
      context,
      new Error("SMART status conflicts with an event at the same statusChangedAt timestamp"),
    );
    return;
  }

  const identityBackfill = {
    ...(resolution.shouldBackfillSpaWaiverId ? { spaWaiverId: event.spaWaiverId } : {}),
    ...(!resolution.document.correlationId && event.correlationId
      ? { correlationId: event.correlationId }
      : {}),
  };
  const { domain, index } = getDomainAndNamespace("main");
  if (storedTimestamp !== undefined && storedTimestamp > incomingTimestamp) {
    console.info(
      JSON.stringify({
        message: "Skipping stale SMART status update",
        packageId: event.id.toUpperCase(),
        smartStatus: event.status,
        eventTimestamp: incomingTimestamp,
        latestTimestamp: storedTimestamp,
      }),
    );
    if (Object.keys(identityBackfill).length > 0) {
      await os.updateItem(domain, index, resolution.documentId, identityBackfill);
    }
    return;
  }

  await os.updateItem(
    domain,
    index,
    resolution.documentId,
    buildStatusUpdates(event, resolution.document),
  );
};
