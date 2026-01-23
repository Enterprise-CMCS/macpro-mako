import * as os from "./opensearch-lib";
import { DataSinkEnvelope, IDEMPOTENCY_TTL_SECONDS } from "shared-types";
import { validateEnvVariable } from "shared-utils";
import { opensearch } from "shared-types";

/**
 * Document structure for datasink index
 * Stores the full event envelope plus metadata for idempotency and tracking
 */
export interface DataSinkDocument {
  /** Document ID = eventId for idempotency */
  id: string;
  /** Publishing system (e.g., SMART, ONEMAC) */
  source: string;
  /** Business object category (e.g., WAIVER, SPA) */
  recordType: string;
  /** Business event name (e.g., CREATED, ISSUED_RAI, UPDATED) */
  eventType: string;
  /** Globally unique ID for idempotency (UUID) */
  eventId: string;
  /** ISO-8601 timestamp of the source event */
  eventTime?: string;
  /** Trace ID spanning OneMAC <-> MuleSoft <-> SMART */
  correlationId?: string;
  /** Version of the contract */
  schemaVersion: string;
  /** Domain payload - flexible structure that varies by eventType */
  data: Record<string, unknown>;
  /** When the event was first received (ISO-8601) */
  receivedAt: string;
  /** When the event was processed (ISO-8601) */
  processedAt?: string;
  /** Processing status */
  status: "RECEIVED" | "PROCESSED" | "FAILED";
  /** TTL timestamp for cleanup (Unix epoch seconds) */
  expiresAt?: number;
}

/**
 * Result of an idempotency check
 */
export type IdempotencyCheckResult =
  | { isDuplicate: false; document: DataSinkDocument }
  | { isDuplicate: true; document: DataSinkDocument };

/**
 * Get the OpenSearch domain and datasink index name from environment variables
 */
function getOsConfig(): { osDomain: string; index: opensearch.Index } {
  validateEnvVariable("osDomain");
  validateEnvVariable("indexNamespace");
  const osDomain = process.env.osDomain!;
  const indexNamespace = process.env.indexNamespace || "";
  return {
    osDomain,
    index: `${indexNamespace}datasink` as opensearch.Index,
  };
}

/**
 * Calculate the expiresAt timestamp for TTL (7 days from now)
 */
function calculateExpiresAt(): number {
  return Math.floor(Date.now() / 1000) + IDEMPOTENCY_TTL_SECONDS;
}

/**
 * Check if an event has already been processed (idempotency check)
 * If the document exists, returns it as a duplicate.
 * If not, creates a new document with status "RECEIVED".
 *
 * @param envelope - The incoming event envelope
 * @returns IdempotencyCheckResult indicating if this is a duplicate or new event
 * @throws Error if OpenSearch operation fails
 */
export async function checkIdempotency(
  envelope: DataSinkEnvelope,
): Promise<IdempotencyCheckResult> {
  const { osDomain, index } = getOsConfig();

  console.log(`Checking idempotency for eventId: ${envelope.eventId}`);

  try {
    // Check if document already exists
    const existingItem = await os.getItem(osDomain, index, envelope.eventId);

    if (existingItem && existingItem._source) {
      // Document exists - this is a duplicate
      console.log(`Duplicate event detected for eventId: ${envelope.eventId}`);
      return {
        isDuplicate: true,
        document: existingItem._source as unknown as DataSinkDocument,
      };
    }

    // Document doesn't exist - create a new one with status "RECEIVED"
    const now = new Date().toISOString();
    const newDocument: DataSinkDocument = {
      id: envelope.eventId,
      source: envelope.source,
      recordType: envelope.recordType,
      eventType: envelope.eventType,
      eventId: envelope.eventId,
      eventTime: envelope.eventTime,
      correlationId: envelope.correlationId,
      schemaVersion: envelope.schemaVersion,
      data: envelope.data,
      receivedAt: now,
      status: "RECEIVED",
      expiresAt: calculateExpiresAt(),
    };

    // Store the document using bulkUpdateData with doc_as_upsert
    await os.bulkUpdateData(osDomain, index, [newDocument]);

    console.log(`Created new idempotency document for eventId: ${envelope.eventId}`);
    return {
      isDuplicate: false,
      document: newDocument,
    };
  } catch (error) {
    console.error(`OpenSearch error during idempotency check: ${error}`);
    throw error;
  }
}

/**
 * Update the status of an existing document in the datasink index
 *
 * @param eventId - The event ID to update
 * @param status - The new status
 */
export async function updateEnvelopeStatus(
  eventId: string,
  status: DataSinkDocument["status"],
): Promise<void> {
  const { osDomain, index } = getOsConfig();

  const now = new Date().toISOString();
  const updateDoc = {
    id: eventId,
    status,
    processedAt: status === "PROCESSED" ? now : undefined,
  };

  try {
    await os.bulkUpdateData(osDomain, index, [updateDoc]);
    console.log(`Updated status for eventId ${eventId} to ${status}`);
  } catch (error) {
    console.error(`Error updating status for eventId ${eventId}: ${error}`);
    throw error;
  }
}

/**
 * Get an existing document from the datasink index by eventId
 *
 * @param eventId - The event ID to look up
 * @returns The document if found, undefined otherwise
 */
export async function getDataSinkDocument(
  eventId: string,
): Promise<DataSinkDocument | undefined> {
  const { osDomain, index } = getOsConfig();

  try {
    const result = await os.getItem(osDomain, index, eventId);
    if (result && result._source) {
      return result._source as unknown as DataSinkDocument;
    }
    return undefined;
  } catch (error) {
    console.error(`Error fetching document for eventId ${eventId}: ${error}`);
    throw error;
  }
}
