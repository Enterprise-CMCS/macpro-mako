import { getPackageChangelog } from "libs/api/package";
import * as os from "libs/opensearch-lib";
import { getDomainAndNamespace } from "libs/utils";
import { opensearch, SMART_RECORD_TYPE } from "shared-types";
import { isHiddenSmartReservation } from "shared-utils";
import { z } from "zod";

import { SmartOnemacEventContext } from "./evaluateSmartPackageExistence";
import {
  getSearchHits,
  getTimestampInMilliseconds,
  reportSmartValidationFailure as reportValidationFailure,
  SearchHit,
} from "./smartEventHelpers";

const requiredString = z.string().trim().min(1);
const requiredCorrelationId = z.string().trim();

const smartSplitSpaCreatedSchema = z
  .object({
    authority: z.enum(["Medicaid SPA", "CHIP SPA"]),
    correlationId: requiredCorrelationId,
    createdAt: requiredString.refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "createdAt must be a valid datetime",
    }),
    createdByEmail: z.string().nullish(),
    createdByName: z.string().nullish(),
    createdByUserId: z.string().nullish(),
    id: requiredString,
    operationType: z.literal("MSP_SPLIT_SPA_CREATED"),
    originalSpaId: requiredString,
    originalSpaWaiverId: requiredString,
    origin: z.literal("SMART"),
    spaWaiverId: requiredString,
    splitReason: requiredString,
    splitSpaId: requiredString,
    splitSpaWaiverId: requiredString,
  })
  .passthrough()
  .superRefine((event, context) => {
    if (event.id.toUpperCase() !== event.splitSpaId.toUpperCase()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "id must match splitSpaId",
        path: ["splitSpaId"],
      });
    }

    if (event.spaWaiverId !== event.splitSpaWaiverId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "spaWaiverId must match splitSpaWaiverId",
        path: ["splitSpaWaiverId"],
      });
    }

    if (event.originalSpaId.toUpperCase() === event.splitSpaId.toUpperCase()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "originalSpaId and splitSpaId must differ",
        path: ["splitSpaId"],
      });
    }

    if (event.originalSpaWaiverId === event.splitSpaWaiverId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "originalSpaWaiverId and splitSpaWaiverId must differ",
        path: ["splitSpaWaiverId"],
      });
    }
  });

export type SmartSplitSpaCreatedEvent = z.infer<typeof smartSplitSpaCreatedSchema>;

interface ParentPackage extends SearchHit<opensearch.main.Document> {
  found: true;
}

interface ParentPackageResolution {
  parent: ParentPackage;
  shouldBackfillSpaWaiverId: boolean;
}

interface SplitPackageDocument extends Record<string, unknown> {
  id: string;
}

const getSplitChangeMade = (splitSpaId: string): string =>
  `${splitSpaId} was manually added to OneMAC.`;

const getSplitChangeReason = (
  originalSpaId: string,
  splitReason: string,
  createdByName: string | null | undefined,
): string => {
  const actor = createdByName?.trim();
  const actorText = actor ? ` by ${actor}` : "";
  return `This package was added to OneMAC from SMART. Package was split from SPA ${originalSpaId}${actorText}. Reason: ${splitReason}`;
};

const hasConflictingCorrelationId = (
  document: opensearch.main.Document,
  event: SmartSplitSpaCreatedEvent,
): boolean => {
  const storedCorrelationId = document.correlationId?.trim();
  // Assignment and other later events can refresh correlationId. It identifies
  // this split only while the stored operation still describes the split.
  return Boolean(
    document.operationType === event.operationType &&
      storedCorrelationId &&
      event.correlationId &&
      storedCorrelationId !== event.correlationId,
  );
};

const isMatchingCompletedSplit = (
  document: opensearch.main.Document,
  event: SmartSplitSpaCreatedEvent,
): boolean =>
  document.origin === "SMART" &&
  document.smartRecordType === SMART_RECORD_TYPE.PACKAGE &&
  document.authority === event.authority &&
  document.id.toUpperCase() === event.splitSpaId.toUpperCase() &&
  document.splitSpaId?.toUpperCase() === event.splitSpaId.toUpperCase() &&
  document.spaWaiverId === event.splitSpaWaiverId &&
  document.splitSpaWaiverId === event.splitSpaWaiverId &&
  document.originalSpaId?.toUpperCase() === event.originalSpaId.toUpperCase() &&
  document.originalSpaWaiverId === event.originalSpaWaiverId &&
  !hasConflictingCorrelationId(document, event);

const findParentPackage = async (
  event: SmartSplitSpaCreatedEvent,
): Promise<ParentPackageResolution | undefined> => {
  // The Kafka key is intentionally not used here because SMART may send either
  // the original or split package ID. Prefer the external identifier, then use
  // the original package ID to link a legacy OneMAC parent that SMART has not
  // touched yet.
  const { domain, index } = getDomainAndNamespace("main");
  const result = await os.search(domain, index, {
    size: 3,
    query: {
      bool: {
        must: [{ term: { spaWaiverId: event.originalSpaWaiverId } }],
        must_not: [{ term: { deleted: true } }],
      },
    },
  });
  const hits = getSearchHits<opensearch.main.Document>(result);
  const originalSpaId = event.originalSpaId.toUpperCase();
  const matchingHits = hits.filter(
    (hit) => (hit._source.id ?? hit._id).toUpperCase() === originalSpaId,
  );

  if (hits.length > 0) {
    if (hits.length !== 1 || matchingHits.length !== 1) {
      return undefined;
    }

    const [parent] = matchingHits;
    return {
      parent: {
        ...parent,
        found: true,
      },
      shouldBackfillSpaWaiverId: false,
    };
  }

  const parentById = await os.getItem(domain, index, originalSpaId);
  if (!parentById?._source) {
    return undefined;
  }

  const parentId = (parentById._source.id ?? parentById._id).toUpperCase();
  const storedSpaWaiverId = parentById._source.spaWaiverId?.trim();
  if (
    parentId !== originalSpaId ||
    (storedSpaWaiverId && storedSpaWaiverId !== event.originalSpaWaiverId)
  ) {
    return undefined;
  }

  return {
    parent: {
      ...parentById,
      found: true,
    },
    shouldBackfillSpaWaiverId: !storedSpaWaiverId,
  };
};

// Child-specific snapshots may arrive before the split that makes the package
// visible. Keep those projections while filling the remaining fields from the
// parent; reservation defaults are not authoritative business data.
const reservationProjections = [
  {
    timestamp: "smartStatusChangedAt",
    fields: [
      "seatoolStatus",
      "cmsStatus",
      "stateStatus",
      "smartStatus",
      "statusDate",
      "finalDispositionDate",
      "initialIntakeNeeded",
      "locked",
      "secondClock",
      "raiRequestedDate",
      "raiReceivedDate",
      "raiWithdrawnDate",
      "raiWithdrawEnabled",
    ],
  },
  {
    timestamp: "smartAssignmentChangedAt",
    fields: [
      "smartSrtRoster",
      "leadAnalystName",
      "leadAnalystEmail",
      "leadAnalystOfficerId",
      "smartCpocContactId",
      "reviewTeam",
    ],
  },
  {
    timestamp: "smartPackageDetailsChangedAt",
    fields: [
      "subject",
      "description",
      "types",
      "subTypes",
      "submissionDate",
      "proposedDate",
      "approvedEffectiveDate",
      "state",
    ],
  },
] as const;

const getReservationProjection = (
  reservation: opensearch.main.Document | undefined,
): Record<string, unknown> => {
  const updates: Record<string, unknown> = {};
  if (!reservation) return updates;

  for (const { timestamp, fields } of reservationProjections) {
    if (getTimestampInMilliseconds(reservation[timestamp]) === undefined) continue;
    updates[timestamp] = reservation[timestamp];
    for (const field of fields) {
      if (Object.prototype.hasOwnProperty.call(reservation, field)) {
        updates[field] = reservation[field];
      }
    }
  }
  return updates;
};

const buildSplitPackage = (
  event: SmartSplitSpaCreatedEvent,
  parent: ParentPackage,
  reservation?: opensearch.main.Document,
): SplitPackageDocument => {
  const {
    adminChangeType: _adminChangeType,
    appkChildren: _appkChildren,
    changeMade: _changeMade,
    changelog: _changelog,
    correlationId: _correlationId,
    id: _id,
    idToBeUpdated: _idToBeUpdated,
    mockEvent: _mockEvent,
    origin: _origin,
    originalSpaId: _originalSpaId,
    originalSpaWaiverId: _originalSpaWaiverId,
    smartAssignmentChangedAt: _smartAssignmentChangedAt,
    smartPackageDetailsChangedAt: _smartPackageDetailsChangedAt,
    smartPackageDetailsPreviousId: _smartPackageDetailsPreviousId,
    smartRecordType: _smartRecordType,
    smartStatusChangedAt: _smartStatusChangedAt,
    spaWaiverId: _spaWaiverId,
    splitReason: _splitReason,
    splitSpaId: _splitSpaId,
    splitSpaWaiverId: _splitSpaWaiverId,
    ...parentFields
  } = parent._source;
  const splitSpaId = event.splitSpaId.toUpperCase();
  const originalSpaId = event.originalSpaId.toUpperCase();
  const timestamp = Date.parse(event.createdAt);
  const changeMade = getSplitChangeMade(splitSpaId);
  const changeReason = getSplitChangeReason(originalSpaId, event.splitReason, event.createdByName);

  // Preserve the parent's business data and role-specific statuses. A split
  // event creates a new package; it does not independently transition status.
  return {
    ...parentFields,
    statusDate: timestamp,
    ...getReservationProjection(reservation),
    id: splitSpaId,
    deleted: false,
    origin: "SMART",
    smartRecordType: SMART_RECORD_TYPE.PACKAGE,
    spaWaiverId: event.splitSpaWaiverId,
    correlationId: event.correlationId,
    splitSpaId,
    splitSpaWaiverId: event.splitSpaWaiverId,
    originalSpaId,
    originalSpaWaiverId: event.originalSpaWaiverId,
    splitReason: event.splitReason,
    operationType: event.operationType,
    makoChangedDate: Math.max(
      timestamp,
      getTimestampInMilliseconds(reservation?.makoChangedDate) ?? timestamp,
    ),
    changedDate: Math.max(
      timestamp,
      getTimestampInMilliseconds(reservation?.changedDate) ?? timestamp,
    ),
    timestamp,
    idToBeUpdated: originalSpaId,
    isAdminChange: true,
    adminChangeType: "split-spa",
    changeMade,
    changeReason,
  };
};

const promoteSplitReservation = async (
  event: SmartSplitSpaCreatedEvent,
  parent: ParentPackage,
  reservation: NonNullable<Awaited<ReturnType<typeof os.getItem>>>,
): Promise<void> => {
  const { domain, index } = getDomainAndNamespace("main");
  const document = buildSplitPackage(event, parent, reservation._source);
  if (typeof reservation._seq_no === "number" && typeof reservation._primary_term === "number") {
    await os.updateItem(domain, index, event.splitSpaId.toUpperCase(), document, {
      ifSeqNo: reservation._seq_no,
      ifPrimaryTerm: reservation._primary_term,
    });
    return;
  }

  await os.updateItem(domain, index, event.splitSpaId.toUpperCase(), document);
};

const validateTargetAvailability = (
  context: SmartOnemacEventContext,
  event: SmartSplitSpaCreatedEvent,
): Error | undefined => {
  const splitSpaId = event.splitSpaId.toUpperCase();
  const externalIdCollisions = getSearchHits<opensearch.main.Document>(
    context.existence.mainBySpaWaiverId,
  ).filter((hit) => (hit._source.id ?? hit._id).toUpperCase() !== splitSpaId);

  if (externalIdCollisions.length > 0) {
    return new Error("splitSpaWaiverId is already associated with another package ID");
  }

  const existingTarget = context.existence.mainById;
  if (!existingTarget) {
    return undefined;
  }

  if (
    existingTarget._source?.deleted === true ||
    (existingTarget._source?.authority && existingTarget._source.authority !== event.authority)
  ) {
    return new Error("splitSpaId requires a non-deleted package with matching authority");
  }

  if (existingTarget._source?.spaWaiverId !== event.splitSpaWaiverId) {
    return new Error("splitSpaId is already associated with another external identifier");
  }

  if (
    existingTarget._source.smartRecordType === SMART_RECORD_TYPE.PACKAGE &&
    existingTarget._source.origin === "SMART"
  ) {
    if (!isMatchingCompletedSplit(existingTarget._source, event)) {
      return new Error("splitSpaId is already associated with a different SMART split event");
    }
    return undefined;
  }

  if (!isHiddenSmartReservation(existingTarget._source)) {
    return new Error("splitSpaId is already used by a non-reservation package");
  }

  return undefined;
};

const persistSplitPackage = async (
  context: SmartOnemacEventContext,
  event: SmartSplitSpaCreatedEvent,
  parent: ParentPackage,
): Promise<Error | undefined> => {
  const { domain, index } = getDomainAndNamespace("main");
  const existingTarget = context.existence.mainById;

  if (existingTarget) {
    if (isMatchingCompletedSplit(existingTarget._source, event)) {
      return undefined;
    }

    await promoteSplitReservation(event, parent, existingTarget);
    return undefined;
  }

  const result = await os.createItem(domain, index, buildSplitPackage(event, parent));
  if (result.created) {
    return undefined;
  }

  const racedTarget = await os.getItem(domain, index, event.splitSpaId.toUpperCase());
  if (racedTarget?._source) {
    const availabilityError = validateTargetAvailability(
      { ...context, existence: { ...context.existence, mainById: racedTarget } },
      event,
    );
    if (availabilityError) return availabilityError;

    if (
      isHiddenSmartReservation(racedTarget._source) &&
      racedTarget._source.spaWaiverId === event.splitSpaWaiverId
    ) {
      await promoteSplitReservation(event, parent, racedTarget);
      return undefined;
    }

    if (isMatchingCompletedSplit(racedTarget._source, event)) {
      return undefined;
    }
  }

  return new Error("splitSpaId was claimed by another package during processing");
};

const getActivitySuffix = (originalSpaId: string, changelogId: string): string => {
  const prefix = `${originalSpaId}-`;
  return changelogId.startsWith(prefix) ? changelogId.slice(prefix.length) : changelogId;
};

const persistSplitActivity = async (
  event: SmartSplitSpaCreatedEvent,
  parentChangelog: opensearch.changelog.Response,
): Promise<void> => {
  const splitSpaId = event.splitSpaId.toUpperCase();
  const originalSpaId = event.originalSpaId.toUpperCase();
  const timestamp = Date.parse(event.createdAt);
  const copiedActivity = parentChangelog.hits.hits
    .filter(({ _source }) => {
      const activityTimestamp = getTimestampInMilliseconds(_source.timestamp);
      return activityTimestamp === undefined || activityTimestamp <= timestamp;
    })
    .map(({ _id, _source }) => ({
      ..._source,
      id: `${splitSpaId}-${getActivitySuffix(originalSpaId, _id)}`,
      packageId: splitSpaId,
    }));
  const changeMade = getSplitChangeMade(splitSpaId);
  const changeReason = getSplitChangeReason(originalSpaId, event.splitReason, event.createdByName);
  const adminActivity = {
    id: `${splitSpaId}-smart-split-${event.splitSpaWaiverId}`,
    packageId: splitSpaId,
    event: "split-spa",
    timestamp,
    isAdminChange: true,
    adminChangeType: "split-spa",
    ...(event.authority === "CHIP SPA" ? { changeType: "Manual Update" } : {}),
    authority: event.authority,
    operationType: event.operationType,
    changeMade,
    changeReason,
    additionalInformation: event.splitReason,
    submitterName: event.createdByName ?? "",
    submitterEmail: event.createdByEmail ?? "",
    createdByUserId: event.createdByUserId,
    correlationId: event.correlationId,
    spaWaiverId: event.splitSpaWaiverId,
    originalSpaId,
    originalSpaWaiverId: event.originalSpaWaiverId,
  };
  const { domain, index } = getDomainAndNamespace("changelog");

  await os.bulkUpdateData(domain, index, [...copiedActivity, adminActivity], {
    throwOnBulkError: true,
  });
};

export const handleMspSplitSpaCreated = async (context: SmartOnemacEventContext): Promise<void> => {
  const parsedEvent = smartSplitSpaCreatedSchema.safeParse(context.event);
  if (!parsedEvent.success) {
    await reportValidationFailure(context, parsedEvent.error);
    return;
  }
  const event = parsedEvent.data;

  const availabilityError = validateTargetAvailability(context, event);
  if (availabilityError) {
    await reportValidationFailure(context, availabilityError);
    return;
  }

  const [parentResolution, parentChangelog] = await Promise.all([
    findParentPackage(event),
    getPackageChangelog(event.originalSpaId.toUpperCase()),
  ]);
  if (
    !parentResolution ||
    parentResolution.parent._source.deleted === true ||
    parentResolution.parent._source.authority !== event.authority ||
    isHiddenSmartReservation(parentResolution.parent._source)
  ) {
    await reportValidationFailure(
      context,
      new Error(
        `originalSpaWaiverId/originalSpaId did not resolve to the requested visible ${event.authority}`,
      ),
    );
    return;
  }

  const { parent, shouldBackfillSpaWaiverId } = parentResolution;
  if (shouldBackfillSpaWaiverId) {
    const { domain, index } = getDomainAndNamespace("main");
    await os.updateItem(domain, index, event.originalSpaId.toUpperCase(), {
      spaWaiverId: event.originalSpaWaiverId,
    });
  }

  const persistenceError = await persistSplitPackage(context, event, parent);
  if (persistenceError) {
    await reportValidationFailure(context, persistenceError);
    return;
  }

  await persistSplitActivity(event, parentChangelog);
};
