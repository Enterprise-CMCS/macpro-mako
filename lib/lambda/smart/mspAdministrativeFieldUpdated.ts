import { getPackageChangelog } from "libs/api/package";
import * as os from "libs/opensearch-lib";
import { getDomainAndNamespace } from "libs/utils";
import { opensearch } from "shared-types";
import { isHiddenSmartReservation } from "shared-utils";
import { z } from "zod";

import { SmartOnemacEventContext } from "./evaluateSmartPackageExistence";
import { getStateFromPackageId, transformMspManualRecordCreated } from "./mspManualRecordCreated";
import {
  calendarDate,
  getSearchHits,
  getTimestampInMilliseconds,
  isoDateTime,
  latestIsoDate,
  normalizeSmartDate,
  reportSmartValidationFailure,
  requiredString,
  ResolvedSmartPackage,
  resolveSmartPackage,
  smartDate,
} from "./smartEventHelpers";

const smartAdministrativeFieldUpdatedSchema = z
  .object({
    approvedEffectiveDate: smartDate.nullish(),
    authority: z.literal("Medicaid SPA"),
    correlationId: z.string().trim(),
    createdAt: isoDateTime,
    createdByEmail: z.string().nullish(),
    createdByName: z.string().nullish(),
    createdByUserId: z.string().nullish(),
    id: requiredString,
    initialSubmissionDate: calendarDate,
    operationType: z.literal("MSP_ADMINISTRATIVE_FIELD_UPDATED"),
    origin: z.literal("SMART"),
    proposedEffectiveDate: smartDate.nullish(),
    spaWaiverId: requiredString,
    state: requiredString,
  })
  .passthrough();

type SmartAdministrativeFieldUpdatedEvent = z.infer<typeof smartAdministrativeFieldUpdatedSchema>;

interface AdministrativeResolution extends ResolvedSmartPackage {
  partialRenameTarget?: opensearch.main.ItemResult;
}

interface FieldChange {
  field: string;
  from: unknown;
  to: unknown;
}

const getCalendarDate = (value: unknown, timeZone: string): string | undefined => {
  const timestamp = getTimestampInMilliseconds(value);
  if (timestamp === undefined) return undefined;

  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(new Date(timestamp));
  const part = (type: Intl.DateTimeFormatPartTypes): string | undefined =>
    parts.find((datePart) => datePart.type === type)?.value;
  const year = part("year");
  const month = part("month");
  const day = part("day");
  return year && month && day ? `${year}-${month}-${day}` : undefined;
};

const sameDate = (left: unknown, eventValue: string, timeZone: string): boolean => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(eventValue)) {
    return getCalendarDate(left, timeZone) === eventValue;
  }

  return getTimestampInMilliseconds(left) === Date.parse(eventValue);
};

const ADMINISTRATIVE_DATE_TIME_ZONES: Record<string, string> = {
  "Initial Submission Date": "America/New_York",
  "Approved Effective Date": "UTC",
  "Proposed Effective Date": "UTC",
};

const displayValue = (field: string, value: unknown): string => {
  if (value === undefined || value === null || value === "") return "not set";

  const timeZone = ADMINISTRATIVE_DATE_TIME_ZONES[field];
  if (timeZone) {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    return getCalendarDate(value, timeZone) ?? String(value);
  }

  return String(value);
};

const getChangeMade = (changes: FieldChange[]): string =>
  changes
    .map(
      ({ field, from, to }) =>
        `${field} changed from ${displayValue(field, from)} to ${displayValue(field, to)}`,
    )
    .join("; ");

const resolveAdministrativePackage = (
  context: SmartOnemacEventContext,
  event: SmartAdministrativeFieldUpdatedEvent,
): AdministrativeResolution | Error | undefined => {
  const activeExternalHits = getSearchHits<opensearch.main.Document>(
    context.existence.mainBySpaWaiverId,
  ).filter(({ _source }) => _source.deleted !== true);

  if (activeExternalHits.length === 2) {
    const targetId = event.id.toUpperCase();
    const target = activeExternalHits.find(
      ({ _id, _source }) => (_source.id ?? _id).toUpperCase() === targetId,
    );
    const source = activeExternalHits.find(({ _id }) => _id !== target?._id);
    const targetTimestamp = getTimestampInMilliseconds(
      target?._source.smartAdministrativeChangedAt,
    );
    if (
      !target ||
      !source ||
      targetTimestamp !== Date.parse(event.createdAt) ||
      target._source.smartAdministrativePreviousId?.toUpperCase() !==
        (source._source.id ?? source._id).toUpperCase()
    ) {
      return new Error("spaWaiverId is associated with multiple active OneMAC packages");
    }

    return {
      document: source._source,
      documentId: source._id,
      shouldBackfillSpaWaiverId: false,
      partialRenameTarget: { ...target, found: true } as opensearch.main.ItemResult,
    };
  }

  if (activeExternalHits.length > 2) {
    return new Error("spaWaiverId is associated with multiple active OneMAC packages");
  }

  return resolveSmartPackage(context, { allowIdChange: true });
};

const buildAdministrativeUpdates = (
  event: SmartAdministrativeFieldUpdatedEvent,
  document: opensearch.main.Document,
): { changes: FieldChange[]; updates: Record<string, unknown> } => {
  const changes: FieldChange[] = [];
  const updates: Record<string, unknown> = {};
  const normalizedSubmissionDate = normalizeSmartDate(event.initialSubmissionDate);
  const derivedState = getStateFromPackageId(event.id);
  if (!derivedState) throw new Error("package ID does not start with a known state code");

  if (!sameDate(document.submissionDate, event.initialSubmissionDate, "America/New_York")) {
    changes.push({
      field: "Initial Submission Date",
      from: document.submissionDate,
      to: event.initialSubmissionDate,
    });
    updates.submissionDate = normalizedSubmissionDate;
  }
  if (document.state !== derivedState) {
    changes.push({ field: "State", from: document.state, to: derivedState });
    updates.state = derivedState;
  }

  if (event.approvedEffectiveDate != null) {
    const approvedEffectiveDate = normalizeSmartDate(event.approvedEffectiveDate);
    if (!sameDate(document.approvedEffectiveDate, event.approvedEffectiveDate, "UTC")) {
      changes.push({
        field: "Approved Effective Date",
        from: document.approvedEffectiveDate,
        to: event.approvedEffectiveDate,
      });
      updates.approvedEffectiveDate = approvedEffectiveDate;
    }
  }
  if (event.proposedEffectiveDate != null) {
    const proposedDate = normalizeSmartDate(event.proposedEffectiveDate);
    if (!sameDate(document.proposedDate, event.proposedEffectiveDate, "UTC")) {
      changes.push({
        field: "Proposed Effective Date",
        from: document.proposedDate,
        to: event.proposedEffectiveDate,
      });
      updates.proposedDate = proposedDate;
    }
  }

  const currentId = (document.id ?? event.id).toUpperCase();
  const newId = event.id.toUpperCase();
  if (currentId !== newId) {
    changes.unshift({ field: "Package ID", from: currentId, to: newId });
  }

  const createdAt = new Date(event.createdAt).toISOString();
  return {
    changes,
    updates: {
      ...updates,
      smartAdministrativeChangedAt: createdAt,
      operationType: event.operationType,
      makoChangedDate: latestIsoDate(document.makoChangedDate, createdAt),
      changedDate: latestIsoDate(document.changedDate, createdAt),
      ...(!document.spaWaiverId ? { spaWaiverId: event.spaWaiverId } : {}),
      ...(!document.correlationId && event.correlationId
        ? { correlationId: event.correlationId }
        : {}),
    },
  };
};

const getActivitySuffix = (packageId: string, changelogId: string): string => {
  const prefix = `${packageId}-`;
  return changelogId.startsWith(prefix) ? changelogId.slice(prefix.length) : changelogId;
};

const persistAdministrativeActivity = async (
  event: SmartAdministrativeFieldUpdatedEvent,
  oldId: string,
  changes: FieldChange[],
): Promise<void> => {
  const newId = event.id.toUpperCase();
  const timestamp = Date.parse(event.createdAt);
  const isIdChange = oldId !== newId;
  const copiedActivity: { id: string; [key: string]: unknown }[] = [];
  if (isIdChange) {
    const changelog = await getPackageChangelog(oldId);
    copiedActivity.push(
      ...changelog.hits.hits.map(({ _id, _source }) => ({
        ..._source,
        id: `${newId}-${getActivitySuffix(oldId, _id)}`,
        packageId: newId,
      })),
    );
  }

  const changeMade = getChangeMade(changes);
  const adminActivity = {
    id: `${newId}-smart-administrative-${timestamp}`,
    packageId: newId,
    event: isIdChange ? "update-id" : "update-values",
    timestamp,
    isAdminChange: true,
    adminChangeType: isIdChange ? "update-id" : "update-values",
    changeMade,
    submitterName: event.createdByName?.trim() || "SMART",
    submitterEmail: event.createdByEmail?.trim() || "",
    createdByUserId: event.createdByUserId,
    correlationId: event.correlationId,
    spaWaiverId: event.spaWaiverId,
    operationType: event.operationType,
    ...(isIdChange ? { idToBeUpdated: oldId } : {}),
  };
  const { domain, index } = getDomainAndNamespace("changelog");
  await os.bulkUpdateData(domain, index, [...copiedActivity, adminActivity], {
    throwOnBulkError: true,
  });
};

const prepareRenamedPackage = async (
  event: SmartAdministrativeFieldUpdatedEvent,
  resolution: AdministrativeResolution,
  updates: Record<string, unknown>,
): Promise<Error | undefined> => {
  const oldId = (resolution.document.id ?? resolution.documentId).toUpperCase();
  const newId = event.id.toUpperCase();
  const timestamp = Date.parse(event.createdAt);
  const {
    adminChangeType: _adminChangeType,
    changeMade: _changeMade,
    id: _id,
    idToBeUpdated: _idToBeUpdated,
    ...packageFields
  } = resolution.document;
  const newDocument = {
    ...packageFields,
    ...updates,
    id: newId,
    deleted: false,
    smartAdministrativePreviousId: oldId,
  };
  const archivedDocument = {
    ...resolution.document,
    id: `${oldId}-del`,
    deleted: true,
    idToBeUpdated: oldId,
    isAdminChange: true,
    adminChangeType: "update-id",
    timestamp,
  };
  const { domain, index } = getDomainAndNamespace("main");

  // Keep a recoverable copy before creating the new ID. The original active
  // record is not deleted until both the target and its admin history exist.
  await os.bulkUpdateData(domain, index, [archivedDocument], {
    throwOnBulkError: true,
  });

  if (resolution.partialRenameTarget) {
    await os.updateItem(domain, index, resolution.partialRenameTarget._id, newDocument);
    return undefined;
  }

  const result = await os.createItem(domain, index, newDocument);
  if (result.created) return undefined;

  const racedTarget = await os.getItem(domain, index, newId);
  if (
    racedTarget?._source?.spaWaiverId === event.spaWaiverId &&
    racedTarget._source.smartAdministrativePreviousId?.toUpperCase() === oldId &&
    getTimestampInMilliseconds(racedTarget._source.smartAdministrativeChangedAt) === timestamp
  ) {
    await os.updateItem(domain, index, racedTarget._id, newDocument);
    return undefined;
  }

  return new Error("updated package ID was claimed by another package during processing");
};

const deleteRenamedSource = async (packageId: string): Promise<void> => {
  const { domain, index } = getDomainAndNamespace("main");
  await os.bulkUpdateData(domain, index, [{ id: packageId, adminChangeType: "delete" }], {
    throwOnBulkError: true,
  });
};

const createAdministrativeReservation = async (
  context: SmartOnemacEventContext,
  event: SmartAdministrativeFieldUpdatedEvent,
): Promise<Error | undefined> => {
  const baseDocument = transformMspManualRecordCreated(context.event);
  if (!baseDocument) return new Error("package ID does not start with a known state code");
  const {
    approvedEffectiveDate: _approvedEffectiveDate,
    description: _description,
    proposedDate: _proposedDate,
    subject: _subject,
    ...administrativeReservation
  } = baseDocument;
  const { updates } = buildAdministrativeUpdates(
    event,
    administrativeReservation as unknown as opensearch.main.Document,
  );
  const { domain, index } = getDomainAndNamespace("main");
  const result = await os.createItem(domain, index, {
    ...administrativeReservation,
    ...updates,
    // The base reservation uses createdAt as a fallback. This event explicitly
    // owns Initial Submission Date, even when both values fall on the same day.
    submissionDate: normalizeSmartDate(event.initialSubmissionDate),
  });
  return result.created
    ? undefined
    : new Error("package ID was claimed by another record during processing");
};

export const handleMspAdministrativeFieldUpdated = async (
  context: SmartOnemacEventContext,
): Promise<void> => {
  const parsedEvent = smartAdministrativeFieldUpdatedSchema.safeParse(context.event);
  if (!parsedEvent.success) {
    await reportSmartValidationFailure(context, parsedEvent.error);
    return;
  }
  const event = parsedEvent.data;
  const resolution = resolveAdministrativePackage(context, event);
  if (resolution instanceof Error) {
    await reportSmartValidationFailure(context, resolution);
    return;
  }
  if (!resolution) {
    const createError = await createAdministrativeReservation(context, event);
    if (createError) await reportSmartValidationFailure(context, createError);
    return;
  }
  if (resolution.document.deleted === true || resolution.document.authority !== event.authority) {
    await reportSmartValidationFailure(
      context,
      new Error("administrative update requires a non-deleted package with matching authority"),
    );
    return;
  }

  const incomingTimestamp = Date.parse(event.createdAt);
  const storedTimestamp = getTimestampInMilliseconds(
    resolution.document.smartAdministrativeChangedAt,
  );
  const { changes, updates } = buildAdministrativeUpdates(event, resolution.document);
  const currentId = (resolution.document.id ?? resolution.documentId).toUpperCase();
  const isPartialRename = Boolean(resolution.partialRenameTarget);

  if (storedTimestamp !== undefined && storedTimestamp > incomingTimestamp) {
    console.info(
      JSON.stringify({
        message: "Skipping stale SMART administrative-field update",
        packageId: event.id.toUpperCase(),
        eventTimestamp: incomingTimestamp,
        latestTimestamp: storedTimestamp,
      }),
    );
    return;
  }
  if (storedTimestamp === incomingTimestamp && changes.length > 0 && !isPartialRename) {
    await reportSmartValidationFailure(
      context,
      new Error("administrative fields conflict with an event at the same createdAt timestamp"),
    );
    return;
  }

  const target = context.existence.mainById;
  if (
    currentId !== event.id.toUpperCase() &&
    target?._source &&
    target._id !== resolution.partialRenameTarget?._id
  ) {
    await reportSmartValidationFailure(
      context,
      new Error("updated package ID is already occupied by another package"),
    );
    return;
  }

  const isIdChange = currentId !== event.id.toUpperCase();
  if (isIdChange) {
    const renameError = await prepareRenamedPackage(event, resolution, updates);
    if (renameError) {
      await reportSmartValidationFailure(context, renameError);
      return;
    }
  }

  if (changes.length > 0 && !isHiddenSmartReservation(resolution.document)) {
    // Persist this deterministic activity first. If the package write fails,
    // a Kafka retry safely upserts the same activity before repairing the package.
    await persistAdministrativeActivity(event, currentId, changes);
  }

  if (isIdChange) {
    await deleteRenamedSource(currentId);
    return;
  }

  const { domain, index } = getDomainAndNamespace("main");
  await os.updateItem(domain, index, resolution.documentId, updates);
};
