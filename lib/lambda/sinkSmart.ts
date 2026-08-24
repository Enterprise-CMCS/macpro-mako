import { Handler } from "aws-lambda";
import { ErrorType, logError } from "libs/sink-lib";
import { KafkaEvent } from "shared-types";

import { dispatchSmartOnemacEvent } from "./smart/dispatchSmartOnemacEvent";
import { parseSmartKafkaRecord } from "./smart/parseSmartKafkaRecord";
import { parseSmartOnemacEvent } from "./smart/parseSmartOnemacEvent";

export { parseSmartKafkaRecord, parseSmartOnemacEvent };

export const handler: Handler<KafkaEvent> = async (event) => {
  for (const [topicPartition, kafkaRecords] of Object.entries(event.records)) {
    for (const kafkaRecord of kafkaRecords) {
      try {
        const payload = parseSmartKafkaRecord(kafkaRecord, topicPartition);
        if (!payload) {
          continue;
        }

        const smartEvent = parseSmartOnemacEvent(payload);
        if (!smartEvent) {
          continue;
        }

        await dispatchSmartOnemacEvent(smartEvent, topicPartition);
      } catch (error) {
        logError({
          type: ErrorType.UNKNOWN,
          error,
          metadata: { topicPartition, kafkaRecord },
        });
        throw error;
      }
    }
  }
};
