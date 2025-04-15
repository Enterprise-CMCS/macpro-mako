import { Handler } from "aws-lambda";
import { ErrorType, getTopic, logError } from "libs";
import { KafkaEvent } from "shared-types";

import {
  insertNewSeatoolRecordsFromKafkaIntoMako,
  insertOneMacRecordsFromKafkaIntoMako,
  syncSeatoolRecordDatesFromKafkaWithMako,
} from "./sinkMainProcessors";

export const handler: Handler<KafkaEvent> = async (event) => {
  const prettifiedEventJSON = JSON.stringify(event, null, 2);

  try {
    await Promise.all(
      Object.entries(event.records).map(async ([topicPartition, records]) => {
        const topic = getTopic(topicPartition);

        switch (topic) {
          case "aws.onemac.migration.cdc":
            return insertOneMacRecordsFromKafkaIntoMako(records, topicPartition);

          case "aws.seatool.ksql.onemac.three.agg.State_Plan":
            return insertNewSeatoolRecordsFromKafkaIntoMako(records, topicPartition);

          case "aws.seatool.debezium.changed_date.SEA.dbo.State_Plan":
            return syncSeatoolRecordDatesFromKafkaWithMako(records, topicPartition);

          default:
            logError({ type: ErrorType.BADTOPIC });
            throw new Error(`topic (${topicPartition}) is invalid`);
        }
      }),
    );
  } catch (error) {
    logError({ type: ErrorType.UNKNOWN, metadata: { event: prettifiedEventJSON } });

    throw error;
  }
};
