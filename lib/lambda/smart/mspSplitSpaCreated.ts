import { getPackageChangelog } from "libs/api/package";
import * as os from "libs/opensearch-lib";
import { ErrorType, logError } from "libs/sink-lib";
import { getDomainAndNamespace } from "libs/utils";
import { opensearch, SMART_RECORD_TYPE } from "shared-types";
import { isHiddenSmartReservation } from "shared-utils";
import { z } from "zod";

import { SmartOnemacEventContext } from "./evaluateSmartPackageExistence";
import { publishSmartIngestError } from "./publishSmartIngestError";

const requiredString = z.string().trim().min(1);
const requiredCorrelationId = z.string().trim();

const smartSplitSpaCreatedSchema = z
  .object({
    authority: z.literal("Medicaid SPA"),
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
  });

export type SmartSplitSpaCreatedEvent = z.infer<typeof smartSplitSpaCreatedSchema>;

interface SearchHit<TDocument> {
  _id: string;
  _source: TDocument;
}

interface ParentPackage extends SearchHit<opensearch.main.Document> {
  found: true;
}

interface SplitPackageDocument extends Record<string, unknown> {
  id: string;
}

const getSplitChangeMade = (splitSpaId: string, originalSpaId: string): string =>
  `Created split SPA ${splitSpaId} from ${originalSpaId}`;

const hasConflictingCorrelationId = (
  document: opensearch.main.Document,
  event: SmartSplitSpaCreatedEvent,
): boolean => {
  const storedCorrelationId = document.correlationId?.trim();
  return Boolean(
    storedCorrelationId && event.correlationId && storedCorrelationId !== event.correlationId,
  );
};

const isMatchingCompletedSplit = (
  document: opensearch.main.Document,
  event: SmartSplitSpaCreatedEvent,
): boolean =>
  document.origin === "SMART" &&
  document.smartRecordType === SMART_RECORD_TYPE.PACKAGE &&
  document.id.toUpperCase() === event.splitSpaId.toUpperCase() &&
  document.splitSpaId?.toUpperCase() === event.splitSpaId.toUpperCase() &&
  document.spaWaiverId === event.splitSpaWaiverId &&
  document.splitSpaWaiverId === event.splitSpaWaiverId &&
  document.originalSpaId?.toUpperCase() === event.originalSpaId.toUpperCase() &&
  document.originalSpaWaiverId === event.originalSpaWaiverId &&
  document.operationType === event.operationType &&
  !hasConflictingCorrelationId(document, event);

const getSearchHits = <TDocument>(result: unknown): SearchHit<TDocument>[] => {
  const hits = (result as { hits?: { hits?: unknown } } | undefined)?.hits?.hits;
  return Array.isArray(hits) ? (hits as SearchHit<TDocument>[]) : [];
};

const reportValidationFailure = async (
  context: SmartOnemacEventContext,
  error: Error | z.ZodError,
): Promise<void> => {
  const { event, topicPartition, kafkaKey, kafkaOffset, kafkaTimestamp } = context;
  logError({
    type: ErrorType.VALIDATION,
    error,
    metadata: {
      topicPartition,
      id: event.id,
      operationType: event.operationType,
    },
  });
  await publishSmartIngestError({
    errorCode: "VALIDATION",
    topicPartition,
    kafkaKey: kafkaKey ?? event.id,
    kafkaOffset,
    kafkaTimestamp,
    correlationId: event.correlationId,
    error,
    payload: event,
  });
};

const findParentPackage = async (
  event: SmartSplitSpaCreatedEvent,
): Promise<ParentPackage | undefined> => {
  // The Kafka key is intentionally not used here because SMART may send either
  // the original or split package ID. The external identifier is authoritative.
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

  if (hits.length !== 1 || matchingHits.length !== 1) {
    return undefined;
  }

  const [parent] = matchingHits;
  return {
    ...parent,
    found: true,
  };
};

const buildSplitPackage = (
  event: SmartSplitSpaCreatedEvent,
  parent: ParentPackage,
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
    smartRecordType: _smartRecordType,
    spaWaiverId: _spaWaiverId,
    splitReason: _splitReason,
    splitSpaId: _splitSpaId,
    splitSpaWaiverId: _splitSpaWaiverId,
    ...parentFields
  } = parent._source;
  const splitSpaId = event.splitSpaId.toUpperCase();
  const originalSpaId = event.originalSpaId.toUpperCase();
  const timestamp = Date.parse(event.createdAt);
  const changeMade = getSplitChangeMade(splitSpaId, originalSpaId);

  // Preserve the parent's business data and role-specific statuses. A split
  // event creates a new package; it does not independently transition status.
  return {
    ...parentFields,
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
    makoChangedDate: timestamp,
    changedDate: timestamp,
    statusDate: timestamp,
    timestamp,
    idToBeUpdated: originalSpaId,
    isAdminChange: true,
    adminChangeType: "split-spa",
    changeMade,
    changeReason: event.splitReason,
  };
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
  document: SplitPackageDocument,
): Promise<Error | undefined> => {
  const { domain, index } = getDomainAndNamespace("main");
  const existingTarget = context.existence.mainById;

  if (existingTarget) {
    if (isMatchingCompletedSplit(existingTarget._source, event)) {
      return undefined;
    }

    await os.updateItem(domain, index, event.splitSpaId.toUpperCase(), document);
    return undefined;
  }

  const result = await os.createItem(domain, index, document);
  if (result.created) {
    return undefined;
  }

  const racedTarget = await os.getItem(domain, index, event.splitSpaId.toUpperCase());
  if (racedTarget?._source) {
    if (
      isHiddenSmartReservation(racedTarget._source) &&
      racedTarget._source.spaWaiverId === event.splitSpaWaiverId
    ) {
      await os.updateItem(domain, index, event.splitSpaId.toUpperCase(), document);
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

const getTimestampInMilliseconds = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value < 1e12 ? value * 1000 : value;
  }

  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }

  const numericValue = Number(value);
  if (Number.isFinite(numericValue)) {
    return numericValue < 1e12 ? numericValue * 1000 : numericValue;
  }

  const parsedValue = Date.parse(value);
  return Number.isNaN(parsedValue) ? undefined : parsedValue;
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
  const changeMade = getSplitChangeMade(splitSpaId, originalSpaId);
  const adminActivity = {
    id: `${splitSpaId}-smart-split-${event.splitSpaWaiverId}`,
    packageId: splitSpaId,
    event: "split-spa",
    timestamp,
    isAdminChange: true,
    adminChangeType: "split-spa",
    changeMade,
    changeReason: event.splitReason,
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

  const [parent, parentChangelog] = await Promise.all([
    findParentPackage(event),
    getPackageChangelog(event.originalSpaId.toUpperCase()),
  ]);
  if (
    !parent ||
    parent._source.authority !== "Medicaid SPA" ||
    isHiddenSmartReservation(parent._source)
  ) {
    await reportValidationFailure(
      context,
      new Error("originalSpaWaiverId did not resolve to the requested visible Medicaid SPA"),
    );
    return;
  }

  const splitPackage = buildSplitPackage(event, parent);
  const persistenceError = await persistSplitPackage(context, event, splitPackage);
  if (persistenceError) {
    await reportValidationFailure(context, persistenceError);
    return;
  }

  await persistSplitActivity(event, parentChangelog);
};
