import {
  ConditionalCheckFailedException,
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import {
  DataSinkEnvelope,
  IdempotencyRecord,
  calculateExpiresAt,
} from "shared-types";
import { validateEnvVariable } from "shared-utils";

/**
 * DynamoDB client singleton for idempotency operations
 */
let dynamoClient: DynamoDBClient | null = null;

function getDynamoClient(): DynamoDBClient {
  if (!dynamoClient) {
    dynamoClient = new DynamoDBClient({});
  }
  return dynamoClient;
}

/**
 * Result of an idempotency check
 */
export type IdempotencyCheckResult =
  | { isDuplicate: false; record: IdempotencyRecord }
  | { isDuplicate: true; record: IdempotencyRecord };

/**
 * Attempt to acquire an idempotency lock for an event.
 * Uses DynamoDB conditional write to ensure atomicity.
 *
 * @param envelope - The incoming event envelope
 * @returns IdempotencyCheckResult indicating if this is a duplicate or new event
 * @throws Error if DynamoDB operation fails (not including conditional check failure)
 */
export async function checkIdempotency(
  envelope: DataSinkEnvelope,
): Promise<IdempotencyCheckResult> {
  validateEnvVariable("idempotencyTableName");
  const tableName = process.env.idempotencyTableName!;
  const client = getDynamoClient();

  const now = new Date().toISOString();
  const record: IdempotencyRecord = {
    eventId: envelope.eventId,
    receivedAt: now,
    status: "RECEIVED",
    source: envelope.source,
    recordType: envelope.recordType,
    eventType: envelope.eventType,
    correlationId: envelope.correlationId,
    expiresAt: calculateExpiresAt(),
  };

  try {
    // Attempt to create a new record with a condition that it doesn't already exist
    await client.send(
      new PutItemCommand({
        TableName: tableName,
        Item: marshall(record, { removeUndefinedValues: true }),
        ConditionExpression: "attribute_not_exists(eventId)",
      }),
    );

    console.log(`Idempotency record created for eventId: ${envelope.eventId}`);
    return { isDuplicate: false, record };
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      // Record already exists - this is a duplicate delivery
      console.log(`Duplicate event detected for eventId: ${envelope.eventId}`);

      // Fetch the existing record to return it
      const existingRecord = await getIdempotencyRecord(envelope.eventId);
      if (existingRecord) {
        return { isDuplicate: true, record: existingRecord };
      }

      // If we can't fetch it (unlikely race condition), return a minimal record
      return {
        isDuplicate: true,
        record: {
          ...record,
          status: "PUBLISHED", // Assume it was published if it exists
        },
      };
    }

    // Re-throw other errors (actual DynamoDB failures)
    console.error(`DynamoDB error during idempotency check: ${error}`);
    throw error;
  }
}

/**
 * Get an existing idempotency record by eventId
 *
 * @param eventId - The event ID to look up
 * @returns The idempotency record if found, null otherwise
 */
export async function getIdempotencyRecord(
  eventId: string,
): Promise<IdempotencyRecord | null> {
  validateEnvVariable("idempotencyTableName");
  const tableName = process.env.idempotencyTableName!;
  const client = getDynamoClient();

  try {
    const result = await client.send(
      new GetItemCommand({
        TableName: tableName,
        Key: marshall({ eventId }),
      }),
    );

    if (!result.Item) {
      return null;
    }

    return unmarshall(result.Item) as IdempotencyRecord;
  } catch (error) {
    console.error(`Error fetching idempotency record for eventId ${eventId}: ${error}`);
    throw error;
  }
}

/**
 * Update the status of an idempotency record after processing
 *
 * @param eventId - The event ID to update
 * @param status - The new status
 */
export async function updateIdempotencyStatus(
  eventId: string,
  status: IdempotencyRecord["status"],
): Promise<void> {
  validateEnvVariable("idempotencyTableName");
  const tableName = process.env.idempotencyTableName!;
  const client = getDynamoClient();

  try {
    await client.send(
      new UpdateItemCommand({
        TableName: tableName,
        Key: marshall({ eventId }),
        UpdateExpression: "SET #status = :status",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: marshall({
          ":status": status,
        }),
      }),
    );

    console.log(`Updated idempotency status for eventId ${eventId} to ${status}`);
  } catch (error) {
    console.error(`Error updating idempotency status for eventId ${eventId}: ${error}`);
    throw error;
  }
}

/**
 * Reset the DynamoDB client (useful for testing)
 */
export function resetDynamoClient(): void {
  dynamoClient = null;
}
