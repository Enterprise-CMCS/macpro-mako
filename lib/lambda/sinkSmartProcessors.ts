import { bulkUpdateDataWrapper, ErrorType, logError } from "libs";
import {
  DataSinkEnvelope,
  DataSinkRecordType,
  DataSinkEventType,
} from "shared-types";

/**
 * Result of processing a SMART event
 */
export type SmartEventProcessingResult = {
  success: boolean;
  eventId: string;
  action?: "upserted" | "skipped" | "forwarded";
  error?: string;
};

/**
 * Extract the business identifier (SPA_ID or Waiver_ID) from the event data
 */
function extractBusinessId(envelope: DataSinkEnvelope): string | null {
  const data = envelope.data;

  // Check for STATE_PLAN.ID_NUMBER (common in SMART events)
  if (data.STATE_PLAN && typeof data.STATE_PLAN === "object") {
    const statePlan = data.STATE_PLAN as Record<string, unknown>;
    if (typeof statePlan.ID_NUMBER === "string") {
      return statePlan.ID_NUMBER;
    }
  }

  // Check for top-level id or ID_NUMBER
  if (typeof data.id === "string") {
    return data.id;
  }
  if (typeof data.ID_NUMBER === "string") {
    return data.ID_NUMBER;
  }

  return null;
}

/**
 * Document type for OpenSearch upsert operations
 */
type OpenSearchDocument = { id: string; [key: string]: unknown };

/**
 * Transform a SMART event into an OpenSearch document
 * This creates a document that can be upserted into the main index
 */
function transformSmartEventToDocument(
  envelope: DataSinkEnvelope,
): OpenSearchDocument | null {
  const businessId = extractBusinessId(envelope);

  if (!businessId) {
    console.warn(`Unable to extract business ID from SMART event: ${envelope.eventId}`);
    return null;
  }

  const data = envelope.data;
  const statePlan = (data.STATE_PLAN || {}) as Record<string, unknown>;

  // Create a base document with the business ID
  const document: OpenSearchDocument = {
    id: businessId,
    smartEventId: envelope.eventId,
    smartEventType: envelope.eventType,
    smartEventTime: envelope.eventTime,
    smartCorrelationId: envelope.correlationId,
    smartSource: envelope.source,
    smartRecordType: envelope.recordType,
    lastSmartUpdate: new Date().toISOString(),
  };

  // Map common STATE_PLAN fields if present
  if (statePlan.SUBMISSION_DATE) {
    document.submissionDate = statePlan.SUBMISSION_DATE;
  }
  if (statePlan.REGION_ID) {
    document.regionId = statePlan.REGION_ID;
  }
  if (statePlan.STATE_CODE) {
    document.stateCode = statePlan.STATE_CODE;
  }
  if (statePlan.TITLE_NAME) {
    document.title = statePlan.TITLE_NAME;
  }
  if (statePlan.STATUS_MEMO) {
    document.statusMemo = statePlan.STATUS_MEMO;
  }
  if (statePlan.CHANGED_DATE) {
    document.changedDate = new Date(statePlan.CHANGED_DATE as number).toISOString();
  }
  if (statePlan.SPW_STATUS_ID !== undefined) {
    document.seatoolStatusId = statePlan.SPW_STATUS_ID;
  }

  // Store the full SMART data for reference
  document.smartData = data;

  return document;
}

/**
 * Determine if this event should be forwarded to the OneMac CDC topic
 * Only certain curated events should be forwarded to maintain separation
 */
function shouldForwardToOneMac(envelope: DataSinkEnvelope): boolean {
  // For now, we don't forward any events automatically
  // This can be enabled later for specific event types that need
  // to be processed by the existing OneMac CDC pipeline
  //
  // Example criteria that might be used:
  // - Only forward status change events
  // - Only forward for specific record types
  // - Only forward events that originated from certain systems
  //
  // const forwardableEventTypes = [
  //   DataSinkEventType.APPROVED,
  //   DataSinkEventType.DISAPPROVED,
  //   DataSinkEventType.WITHDRAWN,
  // ];
  //
  // return forwardableEventTypes.includes(envelope.eventType as DataSinkEventType);

  return false;
}

/**
 * Forward an event to the OneMac CDC topic for processing by sinkMain
 * This is used for curated events that need to be processed by both pipelines
 */
async function forwardToOneMacTopic(envelope: DataSinkEnvelope): Promise<void> {
  // TODO: Implement forwarding to OneMac CDC topic when needed
  // This would use the existing Kafka producer to publish to aws.onemac.migration.cdc
  //
  // const { produceMessage } = await import("libs/api/kafka");
  // const topicName = process.env.oneMacTopicName;
  // const key = extractBusinessId(envelope) || envelope.eventId;
  // await produceMessage(topicName, key, JSON.stringify({
  //   ...envelope,
  //   forwardedFromSmart: true,
  // }));

  console.log(`Would forward event ${envelope.eventId} to OneMac CDC topic (not implemented)`);
}

/**
 * Process a single SMART event
 *
 * 1. Validates the event
 * 2. Transforms it into an OpenSearch document
 * 3. Upserts into the main OpenSearch index
 * 4. Optionally forwards to OneMac CDC topic for additional processing
 */
export async function processSmartEvent(
  envelope: DataSinkEnvelope,
): Promise<SmartEventProcessingResult> {
  const { eventId, source, recordType, eventType } = envelope;

  try {
    // Validate source
    if (source !== "SMART") {
      console.warn(`Received non-SMART event in sinkSmart: ${source}`);
      return {
        success: false,
        eventId,
        error: `Invalid source: ${source}`,
      };
    }

    // Transform the event into an OpenSearch document
    const document = transformSmartEventToDocument(envelope);

    if (!document) {
      return {
        success: false,
        eventId,
        error: "Unable to transform event - missing business ID",
      };
    }

    console.log(`Upserting SMART document to OpenSearch`, {
      id: document.id,
      eventId,
      eventType,
      recordType,
    });

    // Upsert to OpenSearch main index
    await bulkUpdateDataWrapper([document], "main");

    // Check if this event should also be forwarded to OneMac CDC topic
    if (shouldForwardToOneMac(envelope)) {
      await forwardToOneMacTopic(envelope);
      return {
        success: true,
        eventId,
        action: "forwarded",
      };
    }

    return {
      success: true,
      eventId,
      action: "upserted",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logError({
      type: ErrorType.BULKUPDATE,
      error,
      metadata: { eventId, source, recordType, eventType },
    });

    return {
      success: false,
      eventId,
      error: errorMessage,
    };
  }
}

/**
 * Process a batch of SMART events
 * Used for bulk processing when needed
 */
export async function processSmartEventBatch(
  envelopes: DataSinkEnvelope[],
): Promise<SmartEventProcessingResult[]> {
  const results: SmartEventProcessingResult[] = [];

  // Process documents that can be batch-upserted
  const documentsToUpsert: OpenSearchDocument[] = [];
  const eventIdsForDocuments: string[] = [];

  for (const envelope of envelopes) {
    if (envelope.source !== "SMART") {
      results.push({
        success: false,
        eventId: envelope.eventId,
        error: `Invalid source: ${envelope.source}`,
      });
      continue;
    }

    const document = transformSmartEventToDocument(envelope);
    if (document) {
      documentsToUpsert.push(document);
      eventIdsForDocuments.push(envelope.eventId);
    } else {
      results.push({
        success: false,
        eventId: envelope.eventId,
        error: "Unable to transform event - missing business ID",
      });
    }
  }

  // Batch upsert to OpenSearch
  if (documentsToUpsert.length > 0) {
    try {
      await bulkUpdateDataWrapper(documentsToUpsert, "main");

      // Mark all batch-upserted documents as successful
      for (const eventId of eventIdsForDocuments) {
        results.push({
          success: true,
          eventId,
          action: "upserted",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Mark all as failed if batch fails
      for (const eventId of eventIdsForDocuments) {
        results.push({
          success: false,
          eventId,
          error: errorMessage,
        });
      }
    }
  }

  // Handle forwarding for events that need it
  for (const envelope of envelopes) {
    if (shouldForwardToOneMac(envelope)) {
      try {
        await forwardToOneMacTopic(envelope);
      } catch (error) {
        console.error(`Failed to forward event ${envelope.eventId} to OneMac topic:`, error);
      }
    }
  }

  return results;
}
