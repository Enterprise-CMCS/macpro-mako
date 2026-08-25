import { ErrorType, logError } from "libs/sink-lib";
import { z } from "zod";

import type { SmartIngestFailure } from "./publishSmartIngestError";

const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

const isoDateTime = z
  .string()
  .min(1)
  .refine((value) => ISO_DATE_TIME.test(value), {
    message: "createdAt must be an ISO-8601 datetime",
  });

const requiredString = z.string().min(1);
const optionalString = z.string().optional();

const smartOnemacEventSchema = z
  .object({
    spaWaiverId: requiredString,
    id: requiredString,
    correlationId: requiredString,
    origin: z.literal("SMART"),
    authority: requiredString,
    status: requiredString,
    createdAt: isoDateTime,
    createdByUserId: optionalString,
    createdByName: optionalString,
    createdByEmail: optionalString,
    operationType: optionalString,
    creationContext: optionalString,
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
