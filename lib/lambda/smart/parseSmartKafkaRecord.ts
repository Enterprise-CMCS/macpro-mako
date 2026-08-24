import { ErrorType, logError } from "libs/sink-lib";
import { KafkaRecord } from "shared-types";

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

export const parseSmartKafkaRecord = (
  kafkaRecord: KafkaRecord,
  topicPartition: string,
): Record<string, unknown> | undefined => {
  let record: unknown;
  let key: string;

  try {
    key = decodeBase64(kafkaRecord.key);
    record = JSON.parse(decodeBase64(kafkaRecord.value));
  } catch (error) {
    logError({
      type: ErrorType.BADPARSE,
      error,
      metadata: { topicPartition, kafkaRecord },
    });
    return undefined;
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
    return undefined;
  }

  return record as Record<string, unknown>;
};
