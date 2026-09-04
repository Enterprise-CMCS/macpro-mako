import { ErrorType, logError } from "libs/sink-lib";
import { z } from "zod";

import type { SmartIngestFailure } from "./publishSmartIngestError";

const isoDateTime = z
  .string()
  .trim()
  .datetime({ offset: true, message: "createdAt must be a valid ISO-8601 datetime" });

const requiredString = z.string().trim().min(1);
// SMART requires this field in the envelope but may intentionally send it blank.
const requiredCorrelationId = z.string().trim();
const optionalString = z.string().nullish();

const smartOnemacEventSchema = z
  .object({
    spaWaiverId: requiredString,
    id: requiredString,
    correlationId: requiredCorrelationId,
    origin: z.literal("SMART"),
    authority: requiredString,
    status: requiredString,
    createdAt: isoDateTime,
    createdByUserId: optionalString,
    createdByName: optionalString,
    createdByEmail: optionalString,
    operationType: optionalString,
    creationContext: optionalString,
    proposedEffectiveDate: z.union([z.string(), z.number()]).optional(),
    approvedEffectiveDate: z.union([z.string(), z.number()]).optional(),
    subject: optionalString,
    description: optionalString,
    splitSpaId: optionalString,
    splitSpaWaiverId: optionalString,
    originalSpaId: optionalString,
    originalSpaWaiverId: optionalString,
    splitReason: optionalString,
  })
  .passthrough();

export type SmartOnemacEvent = z.infer<typeof smartOnemacEventSchema>;

export type SmartOnemacEventParseResult =
  | { success: true; data: SmartOnemacEvent }
  | { success: false; failure: Omit<SmartIngestFailure, "topicPartition"> };

const readStringField = (payload: unknown, field: string): string | undefined => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return undefined;
  }

  const value = (payload as Record<string, unknown>)[field];
  return typeof value === "string" ? value : undefined;
};

export const interpretSmartOnemacEvent = (payload: unknown): SmartOnemacEventParseResult => {
  const result = smartOnemacEventSchema.safeParse(payload);

  if (!result.success) {
    logError({
      type: ErrorType.VALIDATION,
      error: result.error,
      metadata: { payload },
    });

    return {
      success: false,
      failure: {
        errorCode: "VALIDATION",
        error: result.error,
        kafkaKey: readStringField(payload, "id"),
        correlationId: readStringField(payload, "correlationId"),
        payload,
      },
    };
  }

  return { success: true, data: result.data };
};

export const parseSmartOnemacEvent = (payload: unknown): SmartOnemacEvent | undefined => {
  const result = interpretSmartOnemacEvent(payload);
  return result.success ? result.data : undefined;
};
