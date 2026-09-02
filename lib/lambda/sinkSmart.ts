import { Handler } from "aws-lambda";
import { ErrorType, getTopic, logError } from "libs/sink-lib";
import { KafkaEvent, KafkaRecord } from "shared-types";

import { dispatchSmartOnemacEvent } from "./smart/dispatchSmartOnemacEvent";
import { interpretSmartKafkaRecord, parseSmartKafkaRecord } from "./smart/parseSmartKafkaRecord";
import { interpretSmartOnemacEvent, parseSmartOnemacEvent } from "./smart/parseSmartOnemacEvent";
import { publishSmartIngestError, type SmartIngestFailure } from "./smart/publishSmartIngestError";

export { parseSmartKafkaRecord, parseSmartOnemacEvent };

const SMART_ONEMAC_TOPIC = "aws.mulesoft.onemac.events";

const reportSmartIngestFailure = async (
  failure: Omit<SmartIngestFailure, "topicPartition">,
  topicPartition: string,
  kafkaRecord: KafkaRecord,
): Promise<void> => {
  await publishSmartIngestError({
    ...failure,
    topicPartition,
    topic: failure.topic ?? getTopic(topicPartition) ?? kafkaRecord.topic ?? SMART_ONEMAC_TOPIC,
    kafkaOffset: kafkaRecord.offset,
    kafkaTimestamp: kafkaRecord.timestamp,
  });
};

export const handler: Handler<KafkaEvent> = async (event) => {
  for (const [topicPartition, kafkaRecords] of Object.entries(event.records)) {
    for (const kafkaRecord of kafkaRecords) {
      try {
        const parsedRecord = interpretSmartKafkaRecord(kafkaRecord, topicPartition);
        if (!parsedRecord.success) {
          await reportSmartIngestFailure(parsedRecord.failure, topicPartition, kafkaRecord);
          continue;
        }

        const parsedEvent = interpretSmartOnemacEvent(parsedRecord.data);
        if (!parsedEvent.success) {
          await reportSmartIngestFailure(
            {
              ...parsedEvent.failure,
              kafkaKey: parsedEvent.failure.kafkaKey ?? parsedRecord.kafkaKey,
            },
            topicPartition,
            kafkaRecord,
          );
          continue;
        }

        await dispatchSmartOnemacEvent(parsedEvent.data, {
          topicPartition,
          kafkaKey: parsedRecord.kafkaKey,
          kafkaOffset: kafkaRecord.offset,
          kafkaTimestamp: kafkaRecord.timestamp,
        });
      } catch (error) {
        logError({
          type: ErrorType.UNKNOWN,
          error,
          metadata: {
            topicPartition,
            topic: kafkaRecord.topic,
            partition: kafkaRecord.partition,
            offset: kafkaRecord.offset,
            timestamp: kafkaRecord.timestamp,
          },
        });
        throw error;
      }
    }
  }
};
