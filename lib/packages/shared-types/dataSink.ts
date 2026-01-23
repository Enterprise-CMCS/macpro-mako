import { z } from "zod";

/**
 * Source systems that can send events to the dataSink endpoint
 */
export const DataSinkSource = {
  SMART: "SMART",
  ONEMAC: "ONEMAC",
} as const;

export type DataSinkSource = (typeof DataSinkSource)[keyof typeof DataSinkSource];

/**
 * Record types supported by the dataSink endpoint
 */
export const DataSinkRecordType = {
  WAIVER: "WAIVER",
  SPA: "SPA",
} as const;

export type DataSinkRecordType = (typeof DataSinkRecordType)[keyof typeof DataSinkRecordType];

/**
 * Common event types from SMART system
 * This list can be extended as new event types are defined
 */
export const DataSinkEventType = {
  CREATED: "CREATED",
  UPDATED: "UPDATED",
  ISSUED_RAI: "ISSUED_RAI",
  RESPONDED_TO_RAI: "RESPONDED_TO_RAI",
  APPROVED: "APPROVED",
  DISAPPROVED: "DISAPPROVED",
  WITHDRAWN: "WITHDRAWN",
} as const;

export type DataSinkEventType = (typeof DataSinkEventType)[keyof typeof DataSinkEventType];

/**
 * Schema version for the canonical event envelope
 */
export const DATASINK_SCHEMA_VERSION = "1.0" as const;

/**
 * Canonical event envelope schema for dataSink endpoint
 * All cross-system messages use this single envelope format
 */
export const dataSinkEnvelopeSchema = z.object({
  /** Publishing system (e.g., SMART, ONEMAC) */
  source: z.enum([DataSinkSource.SMART, DataSinkSource.ONEMAC]),

  /** Business object category (e.g., WAIVER, SPA) */
  recordType: z.enum([DataSinkRecordType.WAIVER, DataSinkRecordType.SPA]),

  /** Business event name (e.g., CREATED, ISSUED_RAI, UPDATED) */
  eventType: z.string().min(1),

  /** Globally unique ID for idempotency (UUID) - required for duplicate detection */
  eventId: z.string().uuid(),

  /** ISO-8601 timestamp of the source event */
  eventTime: z.string().datetime().optional(),

  /** Trace ID spanning OneMAC <-> MuleSoft <-> SMART (set by MuleSoft, can change on redelivery) */
  correlationId: z.string().optional(),

  /** Version of the contract (hardcoded to "1.0") */
  schemaVersion: z.literal(DATASINK_SCHEMA_VERSION),

  /** Domain payload - flexible structure that varies by eventType */
  data: z.record(z.unknown()),
});

export type DataSinkEnvelope = z.infer<typeof dataSinkEnvelopeSchema>;

/**
 * Success response schema for dataSink endpoint (202 Accepted)
 */
export const dataSinkResponseSchema = z.object({
  /** Return the eventId from request payload */
  eventId: z.string().uuid(),

  /** Return the correlationId from request payload if present */
  correlationId: z.string().optional(),

  /** Version of the response schema */
  schemaVersion: z.literal(DATASINK_SCHEMA_VERSION),

  /** Optional response data */
  data: z.record(z.unknown()).optional(),
});

export type DataSinkResponse = z.infer<typeof dataSinkResponseSchema>;

/**
 * Error codes for dataSink endpoint responses
 */
export const DataSinkErrorCode = {
  /** Authentication/authorization failure */
  AUTH_ERROR: "AUTH_ERROR",

  /** JSON parse failure */
  PARSE_ERROR: "PARSE_ERROR",

  /** Schema validation failure (missing required fields, invalid types) */
  VALIDATION_ERROR: "VALIDATION_ERROR",

  /** Payload exceeds size limit (~200KB) */
  PAYLOAD_TOO_LARGE: "PAYLOAD_TOO_LARGE",

  /** Downstream service unavailable (DynamoDB, Kafka) */
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",

  /** Unexpected internal error */
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type DataSinkErrorCode = (typeof DataSinkErrorCode)[keyof typeof DataSinkErrorCode];

/**
 * Error response schema for dataSink endpoint (4xx/5xx responses)
 */
export const dataSinkErrorSchema = z.object({
  /** Version of the error schema */
  schemaVersion: z.literal(DATASINK_SCHEMA_VERSION),

  /** Return the correlationId from request payload if present */
  correlationId: z.string().optional(),

  /** Error details */
  error: z.object({
    /** Machine-readable error code */
    code: z.string(),

    /** Human-readable error message */
    message: z.string(),
  }),
});

export type DataSinkError = z.infer<typeof dataSinkErrorSchema>;

/**
 * OpenSearch datasink document schema
 * Used for storing event envelopes and tracking idempotency
 */
export const dataSinkDocumentSchema = z.object({
  /** Document ID = eventId for idempotency */
  id: z.string().uuid(),

  /** Publishing system (e.g., SMART, ONEMAC) */
  source: z.string(),

  /** Business object category (e.g., WAIVER, SPA) */
  recordType: z.string(),

  /** Business event name */
  eventType: z.string(),

  /** Globally unique ID for idempotency (UUID) */
  eventId: z.string().uuid(),

  /** ISO-8601 timestamp of the source event */
  eventTime: z.string().datetime().optional(),

  /** Trace ID spanning OneMAC <-> MuleSoft <-> SMART */
  correlationId: z.string().optional(),

  /** Version of the contract */
  schemaVersion: z.string(),

  /** Domain payload - flexible structure that varies by eventType */
  data: z.record(z.unknown()),

  /** When the event was first received (ISO-8601) */
  receivedAt: z.string().datetime(),

  /** When the event was processed (ISO-8601) */
  processedAt: z.string().datetime().optional(),

  /** Processing status */
  status: z.enum(["RECEIVED", "PROCESSED", "FAILED"]),

  /** TTL timestamp for cleanup (Unix epoch seconds) */
  expiresAt: z.number().optional(),
});

export type DataSinkDocument = z.infer<typeof dataSinkDocumentSchema>;

/**
 * @deprecated Use DataSinkDocument instead - kept for backward compatibility
 */
export type IdempotencyRecord = DataSinkDocument;

/**
 * Helper function to create a success response
 */
export function createDataSinkResponse(
  eventId: string,
  correlationId?: string,
  data?: Record<string, unknown>,
): DataSinkResponse {
  return {
    eventId,
    correlationId,
    schemaVersion: DATASINK_SCHEMA_VERSION,
    data,
  };
}

/**
 * Helper function to create an error response
 */
export function createDataSinkErrorResponse(
  code: DataSinkErrorCode,
  message: string,
  correlationId?: string,
): DataSinkError {
  return {
    schemaVersion: DATASINK_SCHEMA_VERSION,
    correlationId,
    error: {
      code,
      message,
    },
  };
}

/**
 * TTL duration for idempotency records (7 days in seconds)
 */
export const IDEMPOTENCY_TTL_SECONDS = 7 * 24 * 60 * 60;

/**
 * Calculate the expiresAt timestamp for DynamoDB TTL
 */
export function calculateExpiresAt(): number {
  return Math.floor(Date.now() / 1000) + IDEMPOTENCY_TTL_SECONDS;
}
