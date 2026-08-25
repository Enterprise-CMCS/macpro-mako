import { ErrorType, logError } from "libs/sink-lib";
import { KafkaRecord } from "shared-types";

import type { SmartIngestFailure } from "./publishSmartIngestError";

const decodeBase64 = (encodedValue: string): string => {
  const unpaddedValue = encodedValue.replace(/=+$/, "");
  const hasValidCharacters = /^[A-Za-z0-9+/]*={0,2}$/.test(encodedValue);

  if (!hasValidCharacters || unpaddedValue.includes("=") || unpaddedValue.length % 4 === 1) {
    throw new Error("Kafka record contains invalid base64");
  }

  const decodedValue = Buffer.from(encodedValue, "base64");
  const canonicalValue = decodedValue.toString("base64").replace(/=+$/, "");

  if (canonicalValue !== unpaddedValue) {
    throw new Error("Kafka record contains invalid base64");
  }

  return decodedValue.toString("utf8");
};

export type SmartKafkaRecordParseResult =
  | { success: true; data: Record<string, unknown>; kafkaKey: string }
  | { success: false; failure: Omit<SmartIngestFailure, "topicPartition"> };

export const interpretSmartKafkaRecord = (
  kafkaRecord: KafkaRecord,
  topicPartition: string,
): SmartKafkaRecordParseResult => {
  let key: string | undefined;
  let payload: string | undefined;
  let record: unknown;

  try {
    key = decodeBase64(kafkaRecord.key);
    payload = decodeBase64(kafkaRecord.value);
    record = JSON.parse(payload);
  } catch (error) {
    logError({
      type: ErrorType.BADPARSE,
      error,
      metadata: { topicPartition, kafkaRecord },
    });
    return {
      success: false,
      failure: {
        errorCode: "BADPARSE",
        error,
        kafkaKey: key,
        payload,
      },
    };
  }

  if (
    typeof record !== "object" ||
    record === null ||
    Array.isArray(record) ||
    key !== (record as Record<string, unknown>).id
  ) {
    logError({
      type: ErrorType.VALIDATION,
      metadata: { topicPartition, kafkaRecord, record },
    });
    return {
      success: false,
      failure: {
        errorCode: "VALIDATION",
        kafkaKey: key,
        payload: record,
      },
    };
  }

  return {
    success: true,
    data: record as Record<string, unknown>,
    kafkaKey: key,
  };
};

export const parseSmartKafkaRecord = (
  kafkaRecord: KafkaRecord,
  topicPartition: string,
): Record<string, unknown> | undefined => {
  const result = interpretSmartKafkaRecord(kafkaRecord, topicPartition);
  return result.success ? result.data : undefined;
};
