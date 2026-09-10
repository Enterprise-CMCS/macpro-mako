import * as os from "libs/opensearch-lib";
import { ErrorType, logError } from "libs/sink-lib";
import { getDomainAndNamespace } from "libs/utils";
import { opensearch } from "shared-types";
import { isHiddenSmartReservation } from "shared-utils";
import { z } from "zod";

import { SmartOnemacEventContext } from "./evaluateSmartPackageExistence";
import { publishSmartIngestError } from "./publishSmartIngestError";

const requiredString = z.string().trim().min(1);
const isoDateTime = z
  .string()
  .trim()
  .datetime({ offset: true, message: "must be a valid ISO-8601 datetime" });

const smartRaiWithdrawalToggledSchema = z
  .object({
    authority: z.enum(["Medicaid SPA", "CHIP SPA"]),
    correlationId: z.string().trim(),
    createdAt: isoDateTime,
    createdByEmail: z.string().nullish(),
    createdByName: z.string().nullish(),
    createdByUserId: z.string().nullish(),
    id: requiredString,
    operationType: z.literal("MSP_RAI_WITHDRAWAL_TOGGLED"),
    origin: z.literal("SMART"),
    raiId: requiredString,
    raiName: requiredString,
    raiWithdrawnToggle: z.boolean(),
    // createdAt is the common-envelope fallback for early producers that omit
    // the event-specific timestamp.
    raiWithdrawnToggleDate: isoDateTime.nullish(),
    spaWaiverId: requiredString,
  })
  .passthrough();

type SmartRaiWithdrawalToggledEvent = z.infer<typeof smartRaiWithdrawalToggledSchema>;

interface SearchHit<TDocument> {
  _id: string;
  _source: TDocument;
}

interface PackageResolution {
  document: opensearch.main.Document;
  documentId: string;
  shouldBackfillSpaWaiverId: boolean;
}

interface ToggleState {
  enabled?: boolean;
  raiId?: string;
  timestamp: number;
}

const getSearchHits = <TDocument>(result: unknown): SearchHit<TDocument>[] => {
  const hits = (result as { hits?: { hits?: unknown } } | undefined)?.hits?.hits;
  return Array.isArray(hits) ? (hits as SearchHit<TDocument>[]) : [];
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

const resolvePackage = (
  context: SmartOnemacEventContext,
  event: SmartRaiWithdrawalToggledEvent,
): PackageResolution | Error => {
  const expectedId = event.id.toUpperCase();
  const externalIdHits = getSearchHits<opensearch.main.Document>(
    context.existence.mainBySpaWaiverId,
  );

  if (externalIdHits.length > 0) {
    const matchingHits = externalIdHits.filter(
      ({ _id, _source }) => (_source.id ?? _id).toUpperCase() === expectedId,
    );
    if (externalIdHits.length !== 1 || matchingHits.length !== 1) {
      return new Error("spaWaiverId is associated with a different or ambiguous package ID");
    }

    const [match] = matchingHits;
    return {
      document: match._source,
      documentId: match._id,
      shouldBackfillSpaWaiverId: false,
    };
  }

  const packageById = context.existence.mainById;
  if (!packageById?._source) {
    return new Error("spaWaiverId/id did not resolve to an existing OneMAC package");
  }

  const storedId = (packageById._source.id ?? packageById._id).toUpperCase();
  const storedSpaWaiverId = packageById._source.spaWaiverId?.trim();
  if (storedId !== expectedId) {
    return new Error("id did not resolve to the requested OneMAC package");
  }
  if (storedSpaWaiverId && storedSpaWaiverId !== event.spaWaiverId) {
    return new Error("id is already associated with another external identifier");
  }

  return {
    document: packageById._source,
    documentId: packageById._id,
    shouldBackfillSpaWaiverId: !storedSpaWaiverId,
  };
};

const validateResolvedPackage = (
  resolution: PackageResolution,
  event: SmartRaiWithdrawalToggledEvent,
): Error | undefined => {
  if (resolution.document.deleted === true || isHiddenSmartReservation(resolution.document)) {
    return new Error("RAI withdrawal toggle requires an existing visible package");
  }

  if (resolution.document.authority !== event.authority) {
    return new Error("authority does not match the existing package");
  }

  return undefined;
};

const getLatestToggleState = (
  context: SmartOnemacEventContext,
  mainDocument: opensearch.main.Document,
): ToggleState | Error | undefined => {
  const candidates: ToggleState[] = [];
  const mainTimestamp = getTimestampInMilliseconds(mainDocument.raiWithdrawnToggleDate);
  if (mainTimestamp !== undefined) {
    candidates.push({
      enabled: mainDocument.raiWithdrawEnabled,
      raiId: mainDocument.raiId,
      timestamp: mainTimestamp,
    });
  }

  for (const { _source } of getSearchHits<opensearch.changelog.Document>(
    context.existence.changelogById,
  )) {
    if (_source.event !== "toggle-withdraw-rai") continue;
    const timestamp = getTimestampInMilliseconds(_source.timestamp);
    if (timestamp === undefined) continue;
    candidates.push({
      enabled: _source.raiWithdrawEnabled,
      raiId: _source.raiId,
      timestamp,
    });
  }

  if (candidates.length === 0) return undefined;

  const latestTimestamp = Math.max(...candidates.map(({ timestamp }) => timestamp));
  const latestCandidates = candidates.filter(({ timestamp }) => timestamp === latestTimestamp);
  const enabledValues = new Set(
    latestCandidates.flatMap(({ enabled }) => (enabled === undefined ? [] : [enabled])),
  );
  const raiIds = new Set(latestCandidates.flatMap(({ raiId }) => (raiId ? [raiId] : [])));

  if (enabledValues.size > 1 || raiIds.size > 1) {
    return new Error("existing RAI withdrawal toggle state is ambiguous at its latest timestamp");
  }

  return {
    enabled: [...enabledValues][0],
    raiId: [...raiIds][0],
    timestamp: latestTimestamp,
  };
};

const persistToggleActivity = async (
  event: SmartRaiWithdrawalToggledEvent,
  packageId: string,
  timestamp: number,
  toggleDate: string,
): Promise<void> => {
  const action = event.raiWithdrawnToggle ? "Enabled" : "Disabled";
  const activity = {
    id: `${packageId}-smart-rai-toggle-${event.raiId}-${timestamp}-${event.raiWithdrawnToggle ? "enabled" : "disabled"}`,
    packageId,
    event: "toggle-withdraw-rai",
    timestamp,
    isAdminChange: true,
    raiWithdrawEnabled: event.raiWithdrawnToggle,
    raiId: event.raiId,
    raiName: event.raiName,
    raiWithdrawnToggleDate: toggleDate,
    operationType: event.operationType,
    spaWaiverId: event.spaWaiverId,
    correlationId: event.correlationId,
    createdByUserId: event.createdByUserId,
    submitterName: event.createdByName?.trim() || "SMART",
    submitterEmail: event.createdByEmail?.trim() || "",
    changeMade: `${action} State package action to withdraw formal RAI response`,
  };
  const { domain, index } = getDomainAndNamespace("changelog");

  await os.bulkUpdateData(domain, index, [activity], { throwOnBulkError: true });
};

export const handleMspRaiWithdrawalToggled = async (
  context: SmartOnemacEventContext,
): Promise<void> => {
  const parsedEvent = smartRaiWithdrawalToggledSchema.safeParse(context.event);
  if (!parsedEvent.success) {
    await reportValidationFailure(context, parsedEvent.error);
    return;
  }
  const event = parsedEvent.data;
  const resolvedPackage = resolvePackage(context, event);
  if (resolvedPackage instanceof Error) {
    await reportValidationFailure(context, resolvedPackage);
    return;
  }

  const packageError = validateResolvedPackage(resolvedPackage, event);
  if (packageError) {
    await reportValidationFailure(context, packageError);
    return;
  }

  const toggleDate = new Date(event.raiWithdrawnToggleDate ?? event.createdAt).toISOString();
  const timestamp = Date.parse(toggleDate);
  const latestState = getLatestToggleState(context, resolvedPackage.document);
  if (latestState instanceof Error) {
    await reportValidationFailure(context, latestState);
    return;
  }

  if (latestState?.timestamp === timestamp) {
    const conflictsWithState =
      latestState.enabled !== undefined && latestState.enabled !== event.raiWithdrawnToggle;
    const conflictsWithRai = latestState.raiId && latestState.raiId !== event.raiId;
    if (conflictsWithState || conflictsWithRai) {
      await reportValidationFailure(
        context,
        new Error("RAI withdrawal toggle conflicts with an event at the same timestamp"),
      );
      return;
    }
  }

  const packageId = event.id.toUpperCase();
  const isStaleEvent = latestState !== undefined && latestState.timestamp > timestamp;
  const identityBackfill = {
    ...(resolvedPackage.shouldBackfillSpaWaiverId ? { spaWaiverId: event.spaWaiverId } : {}),
    ...(!resolvedPackage.document.correlationId && event.correlationId
      ? { correlationId: event.correlationId }
      : {}),
  };
  if (!isStaleEvent) {
    const mainUpdates: Record<string, unknown> = {
      raiWithdrawEnabled: event.raiWithdrawnToggle,
      raiId: event.raiId,
      raiName: event.raiName,
      raiWithdrawnToggleDate: toggleDate,
      makoChangedDate: toggleDate,
      ...identityBackfill,
    };
    const { domain, index } = getDomainAndNamespace("main");
    await os.updateItem(domain, index, resolvedPackage.documentId, mainUpdates);
  } else {
    console.info(
      JSON.stringify({
        message: "Skipping stale SMART RAI withdrawal toggle state update",
        packageId,
        raiId: event.raiId,
        eventTimestamp: timestamp,
        latestTimestamp: latestState.timestamp,
      }),
    );

    if (Object.keys(identityBackfill).length > 0) {
      const { domain, index } = getDomainAndNamespace("main");
      await os.updateItem(domain, index, resolvedPackage.documentId, identityBackfill);
    }
  }

  // Use a deterministic document ID so a Kafka retry repairs a partial write
  // without duplicating the administrative event.
  await persistToggleActivity(event, packageId, timestamp, toggleDate);
};
