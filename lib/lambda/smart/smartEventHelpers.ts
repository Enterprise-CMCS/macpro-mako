import { TZDate } from "@date-fns/tz";
import { ErrorType, logError } from "libs/sink-lib";
import { opensearch } from "shared-types";
import { z } from "zod";

import { SmartOnemacEventContext } from "./evaluateSmartPackageExistence";
import { publishSmartIngestError } from "./publishSmartIngestError";

export const requiredString = z.string().trim().min(1);
export const isoDateTime = z
  .string()
  .trim()
  .datetime({ offset: true, message: "must be a valid ISO-8601 datetime" });

const isValidCalendarDate = (value: string): boolean => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
};

export const calendarDate = z
  .string()
  .trim()
  .refine(isValidCalendarDate, { message: "must be a valid YYYY-MM-DD date" });

export const smartDate = z.union([calendarDate, isoDateTime]);

export const normalizeSmartDate = (value: string): string => {
  if (isValidCalendarDate(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(
      new TZDate(year, month - 1, day, 0, 0, 0, 0, "America/New_York").getTime(),
    ).toISOString();
  }

  return new Date(value).toISOString();
};

export const getTimestampInMilliseconds = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value < 1e12 ? value * 1000 : value;
  }

  if (typeof value !== "string" || value.trim() === "") return undefined;

  const numericValue = Number(value);
  if (Number.isFinite(numericValue)) {
    return numericValue < 1e12 ? numericValue * 1000 : numericValue;
  }

  const parsedValue = Date.parse(value);
  return Number.isNaN(parsedValue) ? undefined : parsedValue;
};

export const latestIsoDate = (existing: unknown, incoming: string): string => {
  const existingTimestamp = getTimestampInMilliseconds(existing);
  const incomingTimestamp = Date.parse(incoming);
  return existingTimestamp !== undefined && existingTimestamp > incomingTimestamp
    ? new Date(existingTimestamp).toISOString()
    : incoming;
};

export interface SearchHit<TDocument> {
  _id: string;
  _source: TDocument;
}

export const getSearchHits = <TDocument>(result: unknown): SearchHit<TDocument>[] => {
  const hits = (result as { hits?: { hits?: unknown } } | undefined)?.hits?.hits;
  return Array.isArray(hits) ? (hits as SearchHit<TDocument>[]) : [];
};

export interface ResolvedSmartPackage {
  document: opensearch.main.Document;
  documentId: string;
  shouldBackfillSpaWaiverId: boolean;
}

export const resolveSmartPackage = (
  context: SmartOnemacEventContext,
  options: { allowIdChange?: boolean } = {},
): ResolvedSmartPackage | Error | undefined => {
  const eventId = context.event.id.toUpperCase();
  const externalIdHits = getSearchHits<opensearch.main.Document>(
    context.existence.mainBySpaWaiverId,
  ).filter(({ _source }) => _source.deleted !== true);

  if (externalIdHits.length > 1) {
    return new Error("spaWaiverId is associated with multiple active OneMAC packages");
  }

  if (externalIdHits.length === 1) {
    const [match] = externalIdHits;
    const storedId = (match._source.id ?? match._id).toUpperCase();
    if (!options.allowIdChange && storedId !== eventId) {
      return new Error("spaWaiverId is associated with a different package ID");
    }

    return {
      document: match._source,
      documentId: match._id,
      shouldBackfillSpaWaiverId: false,
    };
  }

  const packageById = context.existence.mainById;
  if (!packageById?._source) return undefined;

  const storedId = (packageById._source.id ?? packageById._id).toUpperCase();
  const storedSpaWaiverId = packageById._source.spaWaiverId?.trim();
  if (storedId !== eventId) {
    return new Error("id did not resolve to the requested OneMAC package");
  }
  if (storedSpaWaiverId && storedSpaWaiverId !== context.event.spaWaiverId) {
    return new Error("id is already associated with another external identifier");
  }

  return {
    document: packageById._source,
    documentId: packageById._id,
    shouldBackfillSpaWaiverId: !storedSpaWaiverId,
  };
};

export const reportSmartValidationFailure = async (
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
