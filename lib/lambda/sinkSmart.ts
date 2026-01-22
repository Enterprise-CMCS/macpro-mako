import { Handler } from "aws-lambda";
import { ErrorType, logError } from "libs";
import { KafkaEvent, KafkaRecord, DataSinkEnvelope } from "shared-types";
import { decodeBase64WithUtf8 } from "shared-utils";

import { processSmartEvent, SmartEventProcessingResult } from "./sinkSmartProcessors";

/**
 * Extract the topic name from the topic partition string
 * e.g., "aws.smart.inbound.events-0" -> "aws.smart.inbound.events"
 */
function getTopic(topicPartition: string): string {
  const lastDashIndex = topicPartition.lastIndexOf("-");
  if (lastDashIndex === -1) {
    return topicPartition;
  }
  return topicPartition.substring(0, lastDashIndex);
}

/**
 * Parse a SMART event envelope from a Kafka record
 */
function parseSmartEnvelope(kafkaRecord: KafkaRecord): DataSinkEnvelope | null {
  const { value } = kafkaRecord;

  if (!value) {
    console.warn("Kafka record has no value, skipping");
    return null;
  }

  try {
    const decodedValue = decodeBase64WithUtf8(value);
    const envelope = JSON.parse(decodedValue) as DataSinkEnvelope;

    // Validate required fields
    if (!envelope.eventId || !envelope.source || !envelope.recordType || !envelope.eventType) {
      console.warn("Invalid SMART envelope - missing required fields", {
        eventId: envelope.eventId,
        source: envelope.source,
        recordType: envelope.recordType,
        eventType: envelope.eventType,
      });
      return null;
    }

    return envelope;
  } catch (error) {
    console.error("Failed to parse SMART envelope from Kafka record:", error);
    return null;
  }
}

/**
 * Process a batch of SMART events from a single topic partition
 */
async function processSmartTopicPartition(
  records: KafkaRecord[],
  topicPartition: string,
): Promise<void> {
  console.log(`Processing ${records.length} records from ${topicPartition}`);

  const results: SmartEventProcessingResult[] = [];

  for (const kafkaRecord of records) {
    try {
      const envelope = parseSmartEnvelope(kafkaRecord);

      if (!envelope) {
        logError({
          type: ErrorType.BADPARSE,
          metadata: { topicPartition, kafkaRecord },
        });
        continue;
      }

      console.log(`Processing SMART event: ${envelope.eventId}`, {
        source: envelope.source,
        recordType: envelope.recordType,
        eventType: envelope.eventType,
        correlationId: envelope.correlationId,
      });

      const result = await processSmartEvent(envelope);
      results.push(result);

      if (result.success) {
        console.log(`Successfully processed SMART event: ${envelope.eventId}`);
      } else {
        console.warn(`Failed to process SMART event: ${envelope.eventId}`, {
          error: result.error,
        });
      }
    } catch (error) {
      logError({
        type: ErrorType.UNKNOWN,
        error,
        metadata: { topicPartition, kafkaRecord },
      });
    }
  }

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;

  console.log(`Partition ${topicPartition} processing complete`, {
    total: records.length,
    successful: successCount,
    failed: failureCount,
  });
}

/**
 * sinkSmart Lambda handler
 *
 * Consumes SMART events from the dedicated Kafka topic and:
 * 1. Processes each event to update OpenSearch
 * 2. Optionally forwards curated events to the OneMac CDC topic
 *
 * This handler is separate from sinkMain to isolate SMART event processing
 * and reduce risk to existing functionality.
 */
export const handler: Handler<KafkaEvent> = async (event) => {
  const prettifiedEventJSON = JSON.stringify(event, null, 2);

  console.log(`sinkSmart received event: ${prettifiedEventJSON}`);

  try {
    await Promise.all(
      Object.entries(event.records).map(async ([topicPartition, records]) => {
        const topic = getTopic(topicPartition);

        console.log(`Processing topic: ${topic}`);

        // Only process SMART inbound events topic
        if (topic.includes("aws.smart.inbound.events")) {
          return processSmartTopicPartition(records, topicPartition);
        }

        // Log warning for unexpected topics
        console.warn(`Unexpected topic received in sinkSmart: ${topic}`);
        logError({
          type: ErrorType.BADTOPIC,
          metadata: { topicPartition, recordCount: records.length },
        });
      }),
    );
  } catch (error) {
    logError({
      type: ErrorType.UNKNOWN,
      metadata: { event: prettifiedEventJSON },
    });

    throw error;
  }
};
