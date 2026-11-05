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
import { getSmartTypeUpdates, smartTypeSelectionSchema } from "./smartTypeSelections";

const chipSpaPackageDetailsUpdatedSchema = z
  .object({
    approvedEffectiveDate: smartDate.nullish(),
    authority: z.literal("CHIP SPA"),
    correlationId: z.string().trim(),
    createdAt: isoDateTime,
    createdByEmail: z.string().nullish(),
    createdByName: z.string().nullish(),
    createdByUserId: z.string().nullish(),
    description: z.string().nullish(),
    id: requiredString,
    initialSubmissionDate: calendarDate,
    operationType: z.literal("CHIPSPA_PACKAGE_DETAILS_UPDATED"),
    origin: z.literal("SMART"),
    proposedEffectiveDate: smartDate.nullish(),
    spaWaiverId: requiredString,
    state: requiredString,
    statusChangedAt: isoDateTime,
    subject: z.string().nullish(),
    typeSelections: z.array(smartTypeSelectionSchema).nullish(),
  })
  .passthrough();

type ChipSpaPackageDetailsUpdatedEvent = z.infer<typeof chipSpaPackageDetailsUpdatedSchema>;

interface PackageDetailsResolution extends ResolvedSmartPackage {
  partialRenameTarget?: opensearch.main.ItemResult;
}

interface FieldChange {
  field: string;
  from: unknown;
  to: unknown;
}

interface PackageDetailsUpdates {
  administrativeChanges: FieldChange[];
  hasApprovedChanges: boolean;
  updates: Record<string, unknown>;
}

const hasOwn = (value: object, field: string): boolean =>
  Object.prototype.hasOwnProperty.call(value, field);

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

const displayValue = (field: string, value: unknown): string => {
  if (value === undefined || value === null || value === "") return "not set";
  if (field === "Initial Submission Date") {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    return getCalendarDate(value, "America/New_York") ?? String(value);
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

const getChangeReason = (createdByName: string | null | undefined): string => {
  const actor = createdByName?.trim();
  return actor
    ? `This package was updated in OneMAC to reflect an authorized package detail change made in SMART by ${actor}.`
    : "This package was updated in OneMAC to reflect an authorized package detail change made in SMART.";
};

const typeNames = (types: opensearch.main.Document["types"]): string[] =>
  (types ?? [])
    .flatMap((type) => (type?.SPA_TYPE_NAME ? [type.SPA_TYPE_NAME] : []))
    .sort((left, right) => left.localeCompare(right));

const subTypeNames = (subTypes: opensearch.main.Document["subTypes"]): string[] =>
  (subTypes ?? [])
    .flatMap((subType) => (subType?.TYPE_NAME ? [subType.TYPE_NAME] : []))
    .sort((left, right) => left.localeCompare(right));

const sameStrings = (left: string[], right: string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index]);

const resolvePackageDetailsPackage = (
  context: SmartOnemacEventContext,
  event: ChipSpaPackageDetailsUpdatedEvent,
): PackageDetailsResolution | Error | undefined => {
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
      target?._source.smartPackageDetailsChangedAt,
    );
    if (
      !target ||
      !source ||
      targetTimestamp !== Date.parse(event.statusChangedAt) ||
      target._source.smartPackageDetailsPreviousId?.toUpperCase() !==
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

const buildPackageDetailsUpdates = (
  event: ChipSpaPackageDetailsUpdatedEvent,
  document: opensearch.main.Document,
): PackageDetailsUpdates => {
  const administrativeChanges: FieldChange[] = [];
  const updates: Record<string, unknown> = {};
  let hasApprovedChanges = false;
  const normalizedSubmissionDate = normalizeSmartDate(event.initialSubmissionDate);
  const derivedState = getStateFromPackageId(event.id);
  if (!derivedState) throw new Error("package ID does not start with a known state code");

  if (!sameDate(document.submissionDate, event.initialSubmissionDate, "America/New_York")) {
    administrativeChanges.push({
      field: "Initial Submission Date",
      from: document.submissionDate,
      to: event.initialSubmissionDate,
    });
    updates.submissionDate = normalizedSubmissionDate;
    hasApprovedChanges = true;
  }
  if (document.state !== derivedState) {
    administrativeChanges.push({ field: "State", from: document.state, to: derivedState });
    updates.state = derivedState;
    hasApprovedChanges = true;
  }

  if (hasOwn(event, "subject") && (document.subject ?? null) !== (event.subject ?? null)) {
    updates.subject = event.subject ?? null;
    hasApprovedChanges = true;
  }
  if (
    hasOwn(event, "description") &&
    (document.description ?? null) !== (event.description ?? null)
  ) {
    updates.description = event.description ?? null;
    hasApprovedChanges = true;
  }

  const typeUpdates = getSmartTypeUpdates(event);
  if (typeUpdates) {
    const incomingTypes = typeUpdates.types as opensearch.main.Document["types"];
    const incomingSubTypes = typeUpdates.subTypes as opensearch.main.Document["subTypes"];
    if (
      !sameStrings(typeNames(document.types), typeNames(incomingTypes)) ||
      !sameStrings(subTypeNames(document.subTypes), subTypeNames(incomingSubTypes))
    ) {
      updates.types = incomingTypes;
      updates.subTypes = incomingSubTypes;
      hasApprovedChanges = true;
    }
  }

  // Preserve established MSP behavior: null effective dates are no-ops. A
  // dedicated clear signal is required before OneMAC removes either date.
  if (event.approvedEffectiveDate != null) {
    const approvedEffectiveDate = normalizeSmartDate(event.approvedEffectiveDate);
    if (!sameDate(document.approvedEffectiveDate, event.approvedEffectiveDate, "UTC")) {
      updates.approvedEffectiveDate = approvedEffectiveDate;
      hasApprovedChanges = true;
    }
  }
  if (event.proposedEffectiveDate != null) {
    const proposedDate = normalizeSmartDate(event.proposedEffectiveDate);
    if (!sameDate(document.proposedDate, event.proposedEffectiveDate, "UTC")) {
      updates.proposedDate = proposedDate;
      hasApprovedChanges = true;
    }
  }

  const currentId = (document.id ?? event.id).toUpperCase();
  const newId = event.id.toUpperCase();
  if (currentId !== newId) {
    administrativeChanges.unshift({ field: "Package ID", from: currentId, to: newId });
    hasApprovedChanges = true;
  }

  const statusChangedAt = new Date(event.statusChangedAt).toISOString();
  return {
    administrativeChanges,
    hasApprovedChanges,
    updates: {
      ...updates,
      smartPackageDetailsChangedAt: statusChangedAt,
      operationType: event.operationType,
      ...(hasApprovedChanges
        ? {
            makoChangedDate: latestIsoDate(document.makoChangedDate, statusChangedAt),
            changedDate: latestIsoDate(document.changedDate, statusChangedAt),
          }
        : {}),
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
  event: ChipSpaPackageDetailsUpdatedEvent,
  oldId: string,
  changes: FieldChange[],
): Promise<void> => {
  const newId = event.id.toUpperCase();
  const timestamp = Date.parse(event.statusChangedAt);
  const isIdChange = oldId !== newId;
  const copiedActivity: { id: string; [key: string]: unknown }[] = [];
  const archivedActivity: { id: string; [key: string]: unknown }[] = [];
  if (isIdChange) {
    const archivedId = `${oldId}-del`;
    const [activeChangelog, archivedChangelog] = await Promise.all([
      getPackageChangelog(oldId),
      getPackageChangelog(archivedId),
    ]);
    const sourceActivity = Array.from(
      new Map(
        [...activeChangelog.hits.hits, ...archivedChangelog.hits.hits].map((activity) => [
          activity._id,
          activity,
        ]),
      ).values(),
    );

    copiedActivity.push(
      ...sourceActivity
        .filter(({ _source }) => _source.event !== "delete")
        .map(({ _id, _source }) => ({
          ..._source,
          id: `${newId}-${getActivitySuffix(oldId, _id)}`,
          packageId: newId,
        })),
    );
    archivedActivity.push(
      ...sourceActivity.map(({ _id, _source }) => ({
        ..._source,
        id: _id,
        packageId: archivedId,
      })),
    );
  }

  const adminActivity = {
    id: `${newId}-smart-chip-details-${timestamp}`,
    packageId: newId,
    event: isIdChange ? "update-id" : "update-values",
    timestamp,
    isAdminChange: true,
    adminChangeType: isIdChange ? "update-id" : "update-values",
    changeMade: getChangeMade(changes),
    changeReason: getChangeReason(event.createdByName),
    submitterName: event.createdByName?.trim() || "SMART",
    submitterEmail: event.createdByEmail?.trim() || "",
    createdByUserId: event.createdByUserId,
    correlationId: event.correlationId,
    spaWaiverId: event.spaWaiverId,
    operationType: event.operationType,
    ...(isIdChange ? { idToBeUpdated: oldId } : {}),
  };
  const { domain, index } = getDomainAndNamespace("changelog");
  await os.bulkUpdateData(domain, index, [...copiedActivity, adminActivity, ...archivedActivity], {
    throwOnBulkError: true,
  });
};

const prepareRenamedPackage = async (
  event: ChipSpaPackageDetailsUpdatedEvent,
  resolution: PackageDetailsResolution,
  updates: Record<string, unknown>,
): Promise<Error | undefined> => {
  const oldId = (resolution.document.id ?? resolution.documentId).toUpperCase();
  const newId = event.id.toUpperCase();
  const timestamp = Date.parse(event.statusChangedAt);
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
    smartPackageDetailsPreviousId: oldId,
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
    racedTarget._source.smartPackageDetailsPreviousId?.toUpperCase() === oldId &&
    getTimestampInMilliseconds(racedTarget._source.smartPackageDetailsChangedAt) === timestamp
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

const createPackageDetailsReservation = async (
  context: SmartOnemacEventContext,
  event: ChipSpaPackageDetailsUpdatedEvent,
): Promise<Error | undefined> => {
  const baseDocument = transformMspManualRecordCreated(context.event);
  if (!baseDocument) return new Error("package ID does not start with a known state code");
  const {
    approvedEffectiveDate: _approvedEffectiveDate,
    description: _description,
    proposedDate: _proposedDate,
    subject: _subject,
    ...packageDetailsReservation
  } = baseDocument;
  const { updates } = buildPackageDetailsUpdates(
    event,
    packageDetailsReservation as unknown as opensearch.main.Document,
  );
  const { domain, index } = getDomainAndNamespace("main");
  const result = await os.createItem(domain, index, {
    ...packageDetailsReservation,
    ...updates,
    submissionDate: normalizeSmartDate(event.initialSubmissionDate),
  });
  return result.created
    ? undefined
    : new Error("package ID was claimed by another record during processing");
};

export const handleChipSpaPackageDetailsUpdated = async (
  context: SmartOnemacEventContext,
): Promise<void> => {
  const parsedEvent = chipSpaPackageDetailsUpdatedSchema.safeParse(context.event);
  if (!parsedEvent.success) {
    await reportSmartValidationFailure(context, parsedEvent.error);
    return;
  }
  const event = parsedEvent.data;
  const resolution = resolvePackageDetailsPackage(context, event);
  if (resolution instanceof Error) {
    await reportSmartValidationFailure(context, resolution);
    return;
  }
  if (!resolution) {
    const createError = await createPackageDetailsReservation(context, event);
    if (createError) await reportSmartValidationFailure(context, createError);
    return;
  }
  if (resolution.document.deleted === true || resolution.document.authority !== event.authority) {
    await reportSmartValidationFailure(
      context,
      new Error("package detail update requires a non-deleted package with matching authority"),
    );
    return;
  }

  const incomingTimestamp = Date.parse(event.statusChangedAt);
  const storedTimestamp = getTimestampInMilliseconds(
    resolution.document.smartPackageDetailsChangedAt,
  );
  const { administrativeChanges, hasApprovedChanges, updates } = buildPackageDetailsUpdates(
    event,
    resolution.document,
  );
  const currentId = (resolution.document.id ?? resolution.documentId).toUpperCase();
  const isPartialRename = Boolean(resolution.partialRenameTarget);

  if (storedTimestamp !== undefined && storedTimestamp > incomingTimestamp) {
    console.info(
      JSON.stringify({
        message: "Skipping stale SMART CHIP package-detail update",
        packageId: event.id.toUpperCase(),
        eventTimestamp: incomingTimestamp,
        latestTimestamp: storedTimestamp,
      }),
    );
    return;
  }
  if (storedTimestamp === incomingTimestamp && hasApprovedChanges && !isPartialRename) {
    await reportSmartValidationFailure(
      context,
      new Error("package details conflict with an event at the same statusChangedAt timestamp"),
    );
    return;
  }
  if (storedTimestamp === incomingTimestamp && !hasApprovedChanges && !isPartialRename) return;

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

  if (administrativeChanges.length > 0 && !isHiddenSmartReservation(resolution.document)) {
    await persistAdministrativeActivity(event, currentId, administrativeChanges);
  }

  if (isIdChange) {
    await deleteRenamedSource(currentId);
    return;
  }

  const { domain, index } = getDomainAndNamespace("main");
  await os.updateItem(domain, index, resolution.documentId, updates);
};
