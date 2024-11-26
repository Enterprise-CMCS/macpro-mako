import { Handler } from "aws-lambda";
import { opensearch, KafkaEvent } from "shared-types";
import { ErrorType, getTopic, logError } from "libs";
import { processAndIndex, ksql, changed_date } from "./sinkMainProcessors";
import pino from "pino";

const logger = pino();

export const handler: Handler<KafkaEvent> = async (event) => {
  const prettifiedEventJSON = JSON.stringify(event, null, 2);

  logger.info(`event: ${prettifiedEventJSON}`);

  try {
    Object.keys(event.records).forEach(async (topicPartition) => {
      const topic = getTopic(topicPartition);

      logger.info(`topic: ${topic}`);

      switch (topic) {
        case "aws.onemac.migration.cdc":
          return processAndIndex({
            kafkaRecords: event.records[topicPartition],
            transforms: opensearch.main.transforms,
            topicPartition: topicPartition,
          });

        case "aws.seatool.ksql.onemac.three.agg.State_Plan":
          return ksql(event.records[topicPartition], topicPartition);

        case "aws.seatool.debezium.changed_date.SEA.dbo.State_Plan":
          return changed_date(event.records[topicPartition], topicPartition);

        default:
          logError({ type: ErrorType.BADTOPIC });
          throw new Error(`topic (${topic}) is invalid`);
      }
    });
  } catch (error) {
    logError({ type: ErrorType.UNKNOWN, metadata: { event: prettifiedEventJSON } });

    throw error;
  }
};
