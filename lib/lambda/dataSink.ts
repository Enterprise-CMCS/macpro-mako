import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { checkIdempotency, updateEnvelopeStatus } from "libs";
import {
  createDataSinkErrorResponse,
  createDataSinkResponse,
  dataSinkEnvelopeSchema,
  DataSinkErrorCode,
} from "shared-types";

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
 * ensures idempotency using OpenSearch, and stores the envelope.
 *
 * Response codes:
 * - 202: Event accepted (including duplicate deliveries)
 * - 400: Invalid request (parse error, validation error)
 * - 413: Payload too large
 * - 500: Internal server error
 * - 503: Service unavailable (OpenSearch failure)
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  let correlationId: string | undefined;
  const _requestId = event.requestContext?.requestId || `req-${Date.now()}`;

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

    // Step 5: Idempotency check and storage via OpenSearch
    let idempotencyResult;
    try {
      idempotencyResult = await checkIdempotency(envelope);
    } catch (error) {
      console.error("OpenSearch idempotency check failed:", error);
      return createResponse(
        503,
        createDataSinkErrorResponse(
          DataSinkErrorCode.SERVICE_UNAVAILABLE,
          "Idempotency service temporarily unavailable",
          correlationId,
        ),
      );
    }

    // If this is a duplicate, return 202 without storing again
    if (idempotencyResult.isDuplicate) {
      console.log(`Duplicate event detected, returning 202 for eventId: ${envelope.eventId}`);
      return createResponse(
        202,
        createDataSinkResponse(envelope.eventId, correlationId, {
          message: "Event previously received",
          originalReceivedAt: idempotencyResult.document.receivedAt,
        }),
      );
    }

    // Step 6: Update status to PROCESSED (event successfully stored)
    try {
      await updateEnvelopeStatus(envelope.eventId, "PROCESSED");
    } catch (error) {
      console.error("Failed to update envelope status:", error);

      // Try to mark as FAILED
      try {
        await updateEnvelopeStatus(envelope.eventId, "FAILED");
      } catch (updateError) {
        console.error("Failed to update status to FAILED:", updateError);
      }

      return createResponse(
        503,
        createDataSinkErrorResponse(
          DataSinkErrorCode.SERVICE_UNAVAILABLE,
          "Event storage service temporarily unavailable",
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
