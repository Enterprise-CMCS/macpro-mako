import { Handler } from "aws-lambda";
import { KafkaEvent, KafkaRecord } from "shared-types";
import { ErrorType, logError } from "../libs/sink-lib";
import _ from "lodash";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
const client = new S3Client({
  maxAttempts: 3,
});
const bucket = process.env.bucket;

export const handler: Handler<KafkaEvent> = async (event) => {
  const loggableEvent = { ...event, records: "too large to display" };
  try {
    for (const topicPartition of Object.keys(event.records)) {
      const events: KafkaRecord[] = event.records[topicPartition];
      const orderedEvents = _.sortBy(events, "offset");
      let consecutiveEvents: KafkaRecord[] = [];
      for (let i = 0; i < orderedEvents.length; i++) {
        consecutiveEvents.push(orderedEvents[i]);
        if (
          i == orderedEvents.length - 1 ||
          orderedEvents[i + 1].offset != orderedEvents[i].offset + 1
        ) {
          const offsets = consecutiveEvents.map(function (event) {
            return event.offset;
          });
          const minOffset = Math.min(...offsets);
          const maxOffset = Math.max(...offsets);
          const key = `${topicPartition}/${minOffset}.json`;
          console.log(
            `    Sinking offsets ${minOffset} through ${maxOffset} to s3://${bucket}/${key}`,
          );

          try {
            await client.send(
              new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: Buffer.from(JSON.stringify(consecutiveEvents, null, 2)),
              }),
            );
          } catch (err) {
            console.error("ERROR: Put Object Command failure", err);
          }
          consecutiveEvents = [];
        }
      }
      console.log(topicPartition);
    }
  } catch (error) {
    logError({ type: ErrorType.UNKNOWN, metadata: { event: loggableEvent } });
    throw error;
  }
};
