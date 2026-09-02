import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { ErrorMessages, ErrorType, getTopic } from "libs/sink-lib";
import pino from "pino";
import { ZodError } from "zod";

import {
  ONEMAC_VALIDATION_ERROR_ENVIRONMENT_ATTR,
  ONEMAC_VALIDATION_ERROR_LOCATION,
  ONEMAC_VALIDATION_ERROR_MESSAGE_ATTRIBUTES,
  ONEMAC_VALIDATION_ERROR_SOURCE,
  ONEMAC_VALIDATION_ERROR_TYPE,
  onemacEnvironmentFromStage,
  type OnemacValidationErrorBody,
} from "./bigmacValidationErrorContract";

const logger = pino();
const sqsClient = new SQSClient({ region: process.env.region || process.env.AWS_REGION });

export type SmartIngestErrorCode = "VALIDATION" | "BADPARSE";

export interface SmartIngestFailure {
  errorCode: SmartIngestErrorCode;
  error?: unknown;
  topic?: string;
  topicPartition: string;
  kafkaKey?: string;
  kafkaOffset?: number;
  kafkaTimestamp?: number;
  correlationId?: string;
  payload?: unknown;
}

const SMART_ONEMAC_TOPIC = "aws.mulesoft.onemac.events";

const errorMessageForCode = (errorCode: SmartIngestErrorCode): string => {
  switch (errorCode) {
    case "VALIDATION":
      return ErrorMessages[ErrorType.VALIDATION];
    case "BADPARSE":
      return ErrorMessages[ErrorType.BADPARSE];
    default: {
      const _exhaustive: never = errorCode;
      return _exhaustive;
    }
  }
};

const natureForCode = (errorCode: SmartIngestErrorCode): string => {
  switch (errorCode) {
    case "VALIDATION":
      return "schema-mismatch";
    case "BADPARSE":
      return "unparseable-record";
    default: {
      const _exhaustive: never = errorCode;
      return _exhaustive;
    }
  }
};

const formatErrorDetail = (error: unknown): string | undefined => {
  if (error instanceof ZodError) {
    return error.issues
      .map((issue) => {
        const path = issue.path.join(".");
        return path ? `${path}: ${issue.message}` : issue.message;
      })
      .join("; ");
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return undefined;
};

const buildErrorMessage = (errorCode: SmartIngestErrorCode, error?: unknown): string => {
  const baseMessage = errorMessageForCode(errorCode);
  const detail = formatErrorDetail(error);
  return detail ? `${baseMessage} ${detail}` : baseMessage;
};

const resolveTopic = (failure: SmartIngestFailure): string => {
  return failure.topic ?? getTopic(failure.topicPartition) ?? SMART_ONEMAC_TOPIC;
};

const CREATOR_PII_FIELDS = new Set(["createdByEmail", "createdByName", "createdByUserId"]);

const redactStructuredCreatorPii = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(redactStructuredCreatorPii);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([field]) => !CREATOR_PII_FIELDS.has(field))
      .map(([field, nestedValue]) => [field, redactStructuredCreatorPii(nestedValue)]),
  );
};

const redactCreatorPii = (payload: unknown): unknown =>
  typeof payload === "string" ? undefined : redactStructuredCreatorPii(payload);

const stringAttribute = (value: string) => ({
  DataType: "String",
  StringValue: value,
});

export const publishSmartIngestError = async (failure: SmartIngestFailure): Promise<void> => {
  const queueUrl = process.env.BIGMAC_ERROR_QUEUE_URL;
  if (!queueUrl) {
    logger.warn(
      { custom: { topicPartition: failure.topicPartition, errorCode: failure.errorCode } },
      "BIGMAC_ERROR_QUEUE_URL is not set; skipping BigMAC error-queue publish",
    );
    return;
  }

  const environment = onemacEnvironmentFromStage();
  const topic = resolveTopic(failure);
  const message: OnemacValidationErrorBody = {
    source: ONEMAC_VALIDATION_ERROR_SOURCE,
    errorType: ONEMAC_VALIDATION_ERROR_TYPE,
    environment,
    location: ONEMAC_VALIDATION_ERROR_LOCATION,
    nature: natureForCode(failure.errorCode),
    message: buildErrorMessage(failure.errorCode, failure.error),
    occurredAt: new Date().toISOString(),
    details: {
      errorCode: failure.errorCode,
      topic,
      topicPartition: failure.topicPartition,
      kafkaKey: failure.kafkaKey,
      kafkaOffset: failure.kafkaOffset,
      kafkaTimestamp: failure.kafkaTimestamp,
      correlationId: failure.correlationId,
      // An unparseable value has no trustworthy field boundaries, so it cannot
      // be safely redacted. Omit it rather than forwarding raw submitter PII.
      payload: failure.errorCode === "BADPARSE" ? undefined : redactCreatorPii(failure.payload),
    },
  };

  try {
    await sqsClient.send(
      new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(message),
        MessageAttributes: {
          source: stringAttribute(ONEMAC_VALIDATION_ERROR_MESSAGE_ATTRIBUTES.source),
          errorType: stringAttribute(ONEMAC_VALIDATION_ERROR_MESSAGE_ATTRIBUTES.errorType),
          [ONEMAC_VALIDATION_ERROR_ENVIRONMENT_ATTR]: stringAttribute(environment),
        },
      }),
    );
  } catch (error) {
    logger.error(
      {
        error:
          error instanceof Error
            ? { message: error.message, stack: error.stack }
            : { message: String(error) },
        custom: { topicPartition: failure.topicPartition, errorCode: failure.errorCode },
      },
      "Failed to publish SMART ingest error to the BigMAC queue",
    );
    throw error;
  }
};
