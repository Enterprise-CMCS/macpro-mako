import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Kafka, Message, Producer } from "kafkajs";
import { validateEnvVariable } from "shared-utils";
import {
  dataSinkEnvelopeSchema,
  DataSinkEnvelope,
  DataSinkErrorCode,
  createDataSinkResponse,
  createDataSinkErrorResponse,
  DATASINK_SCHEMA_VERSION,
} from "shared-types";
import { checkIdempotency, updateIdempotencyStatus } from "libs";

/**
 * Kafka client configuration for dataSink
 * Uses a separate clientId to distinguish from other producers
 */
const kafka = new Kafka({
  clientId: "dataSink",
  brokers: process.env.brokerString ? process.env.brokerString.split(",") : [],
  retry: {
    initialRetryTime: 300,
    retries: 8,
  },
  ssl: {
    rejectUnauthorized: false,
  },
});

let producer: Producer | null = null;

function getProducer(): Producer {
  validateEnvVariable("brokerString");
  if (!producer) {
    producer = kafka.producer();
  }
  return producer;
}

/**
 * Publish an event to the SMART Kafka topic
 */
async function publishToKafka(envelope: DataSinkEnvelope): Promise<void> {
  validateEnvVariable("smartTopicName");
  const topicName = process.env.smartTopicName!;
  const kafkaProducer = getProducer();

  await kafkaProducer.connect();

  // Use the ID from the data payload if available, otherwise use eventId
  // The key is used for partitioning and should be the business identifier
  const key = extractBusinessKey(envelope) || envelope.eventId;

  const message: Message = {
    key,
    value: JSON.stringify(envelope),
    partition: 0,
    headers: {
      source: envelope.source.toLowerCase(),
      eventType: envelope.eventType,
      recordType: envelope.recordType,
      correlationId: envelope.correlationId || "",
    },
  };

  console.log(
    "Publishing message to SMART Kafka topic\n" +
      JSON.stringify(
        {
          topic: topicName,
          key,
          source: envelope.source,
          eventType: envelope.eventType,
          recordType: envelope.recordType,
          eventId: envelope.eventId,
        },
        null,
        2,
      ),
  );

  const result = await kafkaProducer.send({
    topic: topicName,
    messages: [message],
  });

  if (!result || result.length === 0) {
    throw new Error("Kafka did not return a valid response.");
  }

  console.log("Message published successfully to SMART topic", result);
}

/**
 * Extract the business key from the event data payload
 * Looks for common identifier fields like ID_NUMBER, id, etc.
 */
function extractBusinessKey(envelope: DataSinkEnvelope): string | undefined {
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

  return undefined;
}

/**
 * Create an API Gateway response with proper headers
 */
function createResponse(
  statusCode: number,
  body: unknown,
  disableCors = false,
): APIGatewayProxyResult {
  const corsHeaders = {
    "Access-Control-Allow-Headers": "Content-Type,X-Api-Key",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST",
  };

  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      ...(disableCors ? {} : corsHeaders),
    },
  };
}

/**
 * DataSink Lambda handler
 *
 * Receives events from SMART via MuleSoft, validates them,
 * ensures idempotency using DynamoDB, and publishes to Kafka.
 *
 * Response codes:
 * - 202: Event accepted (including duplicate deliveries)
 * - 400: Invalid request (parse error, validation error)
 * - 413: Payload too large
 * - 500: Internal server error
 * - 503: Service unavailable (DynamoDB or Kafka failure)
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  let correlationId: string | undefined;

  try {
    console.log("Received dataSink request", {
      httpMethod: event.httpMethod,
      path: event.path,
      contentLength: event.body?.length,
      requestId: event.requestContext?.requestId,
    });

    // Step 1: Check for body
    if (!event.body) {
      console.error("Missing request body");
      return createResponse(
        400,
        createDataSinkErrorResponse(
          DataSinkErrorCode.VALIDATION_ERROR,
          "Request body is required",
          correlationId,
        ),
      );
    }

    // Step 2: Check payload size (~200KB limit)
    const maxPayloadSize = 200 * 1024; // 200KB
    if (event.body.length > maxPayloadSize) {
      console.error(`Payload too large: ${event.body.length} bytes`);
      return createResponse(
        413,
        createDataSinkErrorResponse(
          DataSinkErrorCode.PAYLOAD_TOO_LARGE,
          `Payload exceeds maximum size of ${maxPayloadSize} bytes`,
          correlationId,
        ),
      );
    }

    // Step 3: Parse JSON body
    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(event.body);
    } catch {
      console.error("Failed to parse JSON body");
      return createResponse(
        400,
        createDataSinkErrorResponse(
          DataSinkErrorCode.PARSE_ERROR,
          "Invalid JSON in request body",
          correlationId,
        ),
      );
    }

    // Extract correlationId early for error responses
    if (typeof parsedBody === "object" && parsedBody !== null) {
      correlationId = (parsedBody as Record<string, unknown>).correlationId as string | undefined;
    }

    // Step 4: Validate envelope schema
    const validationResult = dataSinkEnvelopeSchema.safeParse(parsedBody);
    if (!validationResult.success) {
      const errors = validationResult.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      console.error("Schema validation failed:", errors);
      return createResponse(
        400,
        createDataSinkErrorResponse(
          DataSinkErrorCode.VALIDATION_ERROR,
          `Schema validation failed: ${errors}`,
          correlationId,
        ),
      );
    }

    const envelope = validationResult.data;
    correlationId = envelope.correlationId;

    console.log("Validated envelope", {
      eventId: envelope.eventId,
      source: envelope.source,
      recordType: envelope.recordType,
      eventType: envelope.eventType,
      correlationId: envelope.correlationId,
    });

    // Step 5: Idempotency check
    let idempotencyResult;
    try {
      idempotencyResult = await checkIdempotency(envelope);
    } catch (error) {
      console.error("DynamoDB idempotency check failed:", error);
      return createResponse(
        503,
        createDataSinkErrorResponse(
          DataSinkErrorCode.SERVICE_UNAVAILABLE,
          "Idempotency service temporarily unavailable",
          correlationId,
        ),
      );
    }

    // If this is a duplicate, return 202 without publishing again
    if (idempotencyResult.isDuplicate) {
      console.log(`Duplicate event detected, returning 202 for eventId: ${envelope.eventId}`);
      return createResponse(
        202,
        createDataSinkResponse(envelope.eventId, correlationId, {
          message: "Event previously received",
          originalReceivedAt: idempotencyResult.record.receivedAt,
        }),
      );
    }

    // Step 6: Publish to Kafka
    try {
      await publishToKafka(envelope);

      // Update idempotency record to PUBLISHED
      await updateIdempotencyStatus(envelope.eventId, "PUBLISHED");
    } catch (error) {
      console.error("Kafka publish failed:", error);

      // Update idempotency record to FAILED
      try {
        await updateIdempotencyStatus(envelope.eventId, "FAILED");
      } catch (updateError) {
        console.error("Failed to update idempotency status:", updateError);
      }

      return createResponse(
        503,
        createDataSinkErrorResponse(
          DataSinkErrorCode.SERVICE_UNAVAILABLE,
          "Message publishing service temporarily unavailable",
          correlationId,
        ),
      );
    }

    // Step 7: Return success response
    console.log(`Event processed successfully: ${envelope.eventId}`);
    return createResponse(
      202,
      createDataSinkResponse(envelope.eventId, correlationId, {
        message: "Event accepted for processing",
      }),
    );
  } catch (error) {
    console.error("Unexpected error in dataSink handler:", error);
    return createResponse(
      500,
      createDataSinkErrorResponse(
        DataSinkErrorCode.INTERNAL_ERROR,
        "An unexpected error occurred",
        correlationId,
      ),
    );
  }
}

/**
 * Reset Kafka producer (useful for testing)
 */
export function resetKafkaProducer(): void {
  producer = null;
}
