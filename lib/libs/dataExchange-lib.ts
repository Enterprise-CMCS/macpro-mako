import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import axios from "axios";
import {
  DATASINK_SCHEMA_VERSION,
  DataSinkDirection,
  DataSinkEnvelope,
  DataSinkRecordType,
  DataSinkSource,
  DataSinkStatus,
} from "shared-types";
import { v4 as uuidv4 } from "uuid";

import { DataSinkDocument, getOsConfig } from "./dataSink-opensearch-lib";
import * as os from "./opensearch-lib";

// Secrets Manager client - lazy initialized
let secretsClient: SecretsManagerClient | null = null;

// Cached configuration to avoid repeated Secrets Manager calls
let cachedConfig: DataExchangeConfig | null = null;
let configFetchPromise: Promise<DataExchangeConfig | null> | null = null;

/**
 * Configuration for outbound event processing
 */
export interface DataExchangeConfig {
  /** MuleSoft dataExchange endpoint URL */
  endpoint: string;
  /** API key for authentication (optional) */
  apiKey?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeoutMs?: number;
}

/**
 * Result of sending an outbound event
 */
export interface SendResult {
  success: boolean;
  httpStatusCode?: number;
  responseBody?: unknown;
  error?: string;
}

/**
 * Input record structure from Kafka/OneMac
 * Flexible to accommodate various record types
 */
export interface OutboundRecordInput {
  /** Business key (e.g., SPA ID, Waiver ID) */
  id: string;
  /** Record type (will be mapped to WAIVER or SPA) */
  authority?: string;
  /** Event type from the source */
  event?: string;
  /** Original event type */
  eventType?: string;
  /** Any additional data */
  [key: string]: unknown;
}

/**
 * Initialize the Secrets Manager client (lazy initialization)
 */
function getSecretsClient(): SecretsManagerClient {
  if (!secretsClient) {
    secretsClient = new SecretsManagerClient({});
  }
  return secretsClient;
}

/**
 * Fetch credentials from Secrets Manager
 * @param secretName - The name of the secret to fetch
 * @returns The parsed secret containing endpoint and apiKey
 */
async function fetchSecretCredentials(
  secretName: string,
): Promise<{ endpoint?: string; apiKey?: string } | null> {
  try {
    const client = getSecretsClient();
    const response = await client.send(new GetSecretValueCommand({ SecretId: secretName }));

    if (!response.SecretString) {
      console.error("Secret value is empty");
      return null;
    }

    return JSON.parse(response.SecretString);
  } catch (error) {
    console.error("Failed to fetch dataExchange credentials from Secrets Manager:", error);
    return null;
  }
}

/**
 * Get the dataExchange endpoint configuration from Secrets Manager
 * Returns null if endpoint is not configured (feature disabled)
 * Uses caching to avoid repeated Secrets Manager calls during Lambda execution
 */
export async function getDataExchangeConfig(): Promise<DataExchangeConfig | null> {
  // Return cached config if available
  if (cachedConfig !== null) {
    return cachedConfig;
  }

  // If a fetch is already in progress, wait for it
  if (configFetchPromise !== null) {
    return configFetchPromise;
  }

  // Start fetching the config
  configFetchPromise = (async () => {
    const secretName = process.env.dataExchangeSecretName;

    if (!secretName || secretName.trim() === "") {
      console.log("DataExchange secret not configured - outbound events disabled");
      cachedConfig = null;
      return null;
    }

    const credentials = await fetchSecretCredentials(secretName);

    if (!credentials || !credentials.endpoint || credentials.endpoint.trim() === "") {
      console.log("DataExchange endpoint not found in secret - outbound events disabled");
      cachedConfig = null;
      return null;
    }

    cachedConfig = {
      endpoint: credentials.endpoint.trim(),
      apiKey: credentials.apiKey,
      timeoutMs: parseInt(process.env.dataExchangeTimeoutMs || "30000", 10),
    };

    console.log(
      `DataExchange config loaded from Secrets Manager: endpoint=${cachedConfig.endpoint}`,
    );
    return cachedConfig;
  })();

  const result = await configFetchPromise;
  configFetchPromise = null;
  return result;
}

/**
 * Clear the cached configuration (useful for testing)
 */
export function clearDataExchangeConfigCache(): void {
  cachedConfig = null;
  configFetchPromise = null;
}

/**
 * Map source record type to DataSink record type
 */
function mapRecordType(record: OutboundRecordInput): DataSinkRecordType {
  const authority = record.authority?.toLowerCase() || "";
  const id = record.id?.toLowerCase() || "";

  // Check if it's a waiver based on authority or ID pattern
  if (
    authority.includes("waiver") ||
    authority.includes("1915") ||
    id.includes(".r") // Waiver IDs often contain .R for renewals
  ) {
    return DataSinkRecordType.WAIVER;
  }

  // Default to SPA
  return DataSinkRecordType.SPA;
}

/**
 * Map source event to DataSink event type
 */
function mapEventType(record: OutboundRecordInput): string {
  // Use explicit eventType if available
  if (record.eventType && typeof record.eventType === "string") {
    return record.eventType.toUpperCase();
  }

  // Map from event field
  const event = record.event?.toLowerCase() || "";

  const eventMap: Record<string, string> = {
    "new-submission": "CREATED",
    "respond-to-rai": "RESPONDED_TO_RAI",
    "withdraw-rai": "RAI_WITHDRAWN",
    "withdraw-package": "WITHDRAWN",
    "toggle-rai-response-withdraw": "RAI_RESPONSE_WITHDRAW_TOGGLED",
    "upload-subsequent-documents": "DOCUMENTS_UPLOADED",
    "issue-rai": "ISSUED_RAI",
    approved: "APPROVED",
    disapproved: "DISAPPROVED",
  };

  return eventMap[event] || "UPDATED";
}

/**
 * Create an outbound envelope from a source record
 *
 * @param record - The source record from Kafka/OneMac
 * @returns DataSinkEnvelope ready to be sent to MuleSoft
 */
export function createOutboundEnvelope(record: OutboundRecordInput): DataSinkEnvelope {
  const eventId = uuidv4();
  const now = new Date().toISOString();

  return {
    source: DataSinkSource.ONEMAC,
    recordType: mapRecordType(record),
    eventType: mapEventType(record),
    eventId,
    eventTime: now,
    schemaVersion: DATASINK_SCHEMA_VERSION,
    data: {
      // Include all record data (id is included from record)
      ...record,
    },
  };
}

/**
 * Store an outbound event in the datasink index before sending
 *
 * @param envelope - The outbound envelope to store
 * @param targetEndpoint - The target MuleSoft endpoint URL
 * @returns The stored document
 */
export async function storeOutboundEvent(
  envelope: DataSinkEnvelope,
  targetEndpoint: string,
): Promise<DataSinkDocument> {
  const { osDomain, index } = getOsConfig();
  const now = new Date().toISOString();

  const document: DataSinkDocument = {
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
    status: DataSinkStatus.PENDING_SEND,
    direction: DataSinkDirection.OUTBOUND,
    targetEndpoint,
    attemptCount: 0,
    businessKey: (envelope.data as Record<string, unknown>).id as string | undefined,
  };

  await os.bulkUpdateData(osDomain, index, [document]);
  console.log(`Stored outbound event for eventId: ${envelope.eventId}`);

  return document;
}

/**
 * Update the status of an outbound event after a send attempt
 *
 * @param eventId - The event ID to update
 * @param status - The new status
 * @param httpStatusCode - HTTP status code from the response (if any)
 * @param attemptCount - Current attempt count
 */
export async function updateOutboundStatus(
  eventId: string,
  status: DataSinkStatus,
  httpStatusCode?: number,
  attemptCount?: number,
): Promise<void> {
  const { osDomain, index } = getOsConfig();
  const now = new Date().toISOString();

  const isCompletionStatus =
    status === DataSinkStatus.SENT || status === DataSinkStatus.SEND_FAILED;

  const updateDoc: Partial<DataSinkDocument> & { id: string } = {
    id: eventId,
    status,
    lastAttemptAt: now,
    processedAt: isCompletionStatus ? now : undefined,
    httpStatusCode,
    attemptCount,
  };

  await os.bulkUpdateData(osDomain, index, [updateDoc]);
  console.log(`Updated outbound status for eventId ${eventId} to ${status}`);
}

/**
 * Send an envelope to the MuleSoft dataExchange endpoint
 *
 * @param envelope - The envelope to send
 * @param config - DataExchange configuration
 * @returns SendResult with success status and response details
 */
export async function sendToMuleSoft(
  envelope: DataSinkEnvelope,
  config: DataExchangeConfig,
): Promise<SendResult> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (config.apiKey) {
      headers["x-api-key"] = config.apiKey;
    }

    console.log(`Sending outbound event to ${config.endpoint}: eventId=${envelope.eventId}`);

    const response = await axios.post(config.endpoint, envelope, {
      headers,
      timeout: config.timeoutMs || 30000,
      validateStatus: (status) => status >= 200 && status < 500, // Don't throw for 4xx, we'll handle it
    });

    // Treat 2xx and 202 as success
    if (response.status >= 200 && response.status < 300) {
      console.log(`Successfully sent event ${envelope.eventId} - status ${response.status}`);
      return {
        success: true,
        httpStatusCode: response.status,
        responseBody: response.data,
      };
    }

    // Handle 4xx responses (client errors)
    console.error(
      `Failed to send event ${envelope.eventId} - status ${response.status}: ${JSON.stringify(response.data)}`,
    );
    return {
      success: false,
      httpStatusCode: response.status,
      responseBody: response.data,
      error: `HTTP ${response.status}: ${JSON.stringify(response.data)}`,
    };
  } catch (error: unknown) {
    // Handle network errors, timeouts, and 5xx responses
    if (axios.isAxiosError(error)) {
      const httpStatusCode = error.response?.status;
      const responseBody = error.response?.data;

      if (httpStatusCode) {
        // Server returned an error response
        console.error(
          `Failed to send event ${envelope.eventId} - status ${httpStatusCode}: ${JSON.stringify(responseBody)}`,
        );
        return {
          success: false,
          httpStatusCode,
          responseBody,
          error: `HTTP ${httpStatusCode}: ${JSON.stringify(responseBody)}`,
        };
      }

      // Network error or timeout
      const errorMessage = error.message || "Network error";
      console.error(`Error sending event ${envelope.eventId}: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Non-axios error
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error sending event ${envelope.eventId}: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Process a single record for outbound delivery
 * Orchestrates: create envelope → store → send → update status
 *
 * @param record - The source record to process
 * @returns The eventId of the processed event, or null if disabled/failed
 */
export async function processOutboundEvent(record: OutboundRecordInput): Promise<string | null> {
  const config = await getDataExchangeConfig();

  if (!config) {
    // Outbound events are disabled
    return null;
  }

  try {
    // Step 1: Create the outbound envelope
    const envelope = createOutboundEnvelope(record);
    console.log(
      `Processing outbound event: eventId=${envelope.eventId}, recordType=${envelope.recordType}, eventType=${envelope.eventType}`,
    );

    // Step 2: Store the envelope in OpenSearch before sending
    const document = await storeOutboundEvent(envelope, config.endpoint);

    // Step 3: Send to MuleSoft
    const result = await sendToMuleSoft(envelope, config);

    // Step 4: Update status based on result
    const finalStatus = result.success ? DataSinkStatus.SENT : DataSinkStatus.SEND_FAILED;

    await updateOutboundStatus(
      envelope.eventId,
      finalStatus,
      result.httpStatusCode,
      (document.attemptCount || 0) + 1,
    );

    if (!result.success) {
      console.error(`Outbound event ${envelope.eventId} failed: ${result.error}`);
    }

    return envelope.eventId;
  } catch (error) {
    console.error(`Error processing outbound event for record ${record.id}:`, error);
    throw error;
  }
}

/**
 * Process multiple records for outbound delivery
 * Processes each record independently to avoid one failure affecting others
 *
 * @param records - Array of source records to process
 * @returns Array of processed eventIds (null entries for failed/skipped records)
 */
export async function processOutboundEvents(
  records: OutboundRecordInput[],
): Promise<(string | null)[]> {
  const config = await getDataExchangeConfig();

  if (!config) {
    console.log("DataExchange not configured - skipping outbound event processing");
    return records.map(() => null);
  }

  console.log(`Processing ${records.length} records for outbound delivery`);

  const results = await Promise.allSettled(records.map((record) => processOutboundEvent(record)));

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }
    console.error(
      `Failed to process outbound event for record ${records[index].id}:`,
      result.reason,
    );
    return null;
  });
}
