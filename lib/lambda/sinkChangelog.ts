import { Handler } from "aws-lambda";
import { decodeBase64WithUtf8 } from "shared-utils";
import { KafkaEvent, KafkaRecord, opensearch } from "shared-types";
import { ErrorType, bulkUpdateDataWrapper, getTopic, logError } from "libs/sink-lib";
import {
  transformUpdateValuesSchema,
  transformDeleteSchema,
  transformedUpdateIdSchema,
} from "./adminActions/adminSchemas";
import { transformSubmitValuesSchema } from "./adminActions/adminSchemas";
import { copyAttachments } from "./adminActions/submitNOSO";
import { getPackageChangelog } from "libs/api/package";

// One notable difference between this handler and sinkMain's...
// The order in which records are processed for the changelog doesn't matter.
// Because each event is a unique record, and so there is no upserting, order doesn't matter.
export const handler: Handler<KafkaEvent> = async (event) => {
  const loggableEvent = { ...event, records: "too large to display" };
  try {
    for (const topicPartition of Object.keys(event.records)) {
      const topic = getTopic(topicPartition);
      switch (topic) {
        case "aws.onemac.migration.cdc":
          // await legacyAdminChanges(
          //   event.records[topicPartition],
          //   topicPartition,
          // );
          // await onemac(event.records[topicPartition], topicPartition);
          await processAndIndex({
            kafkaRecords: event.records[topicPartition],
            transforms: opensearch.changelog.transforms,
            topicPartition: topicPartition,
          });
          break;
        default:
          logError({ type: ErrorType.BADTOPIC });
          throw new Error(`topic (${topicPartition}) is invalid`);
      }
    }
  } catch (error) {
    logError({ type: ErrorType.UNKNOWN, metadata: { event: loggableEvent } });
    throw error;
  }
};

const processAndIndex = async ({
  kafkaRecords,
  transforms,
  topicPartition,
}: {
  kafkaRecords: KafkaRecord[];
  transforms: any;
  topicPartition: string;
}) => {
  const docs: Array<(typeof transforms)[keyof typeof transforms]["Schema"]> = [];
  for (const kafkaRecord of kafkaRecords) {
    console.log(JSON.stringify(kafkaRecord, null, 2));
    const { value, offset } = kafkaRecord;

    try {
      // If a legacy tombstone, continue
      if (!value) {
        continue;
      }

      // Parse the kafka record's value
      const record = JSON.parse(decodeBase64WithUtf8(value));

      // query all changelog entries for this ID and create copies of all entries with new ID
      if (record.isAdminChange) {
        const schema = transformDeleteSchema(offset).or(
          transformUpdateValuesSchema(offset)
            .or(transformedUpdateIdSchema)
            .or(transformSubmitValuesSchema),
        );

        const result = schema.safeParse(record);

        // attachments function

        if (result.success) {
          if (result.data.adminChangeType === "update-id") {
            docs.forEach((log) => {
              const recordOffset = log.id.split("-").at(-1);

              docs.push({
                ...log,
                id: `${result.data.id}-${recordOffset}`,
                packageId: result.data.id,
              });
            });

            //@ts-ignore
            const packageChangelogs = await getPackageChangelog(result.data.idToBeUpdated);

            packageChangelogs.hits.hits.forEach((log) => {
              const recordOffset = log._id.split("-").at(-1);
              docs.push({
                ...log._source,
                id: `${result.data.id}-${recordOffset}`,
                packageId: result.data.id,
              });
            });
          } else if (result.data.adminChangeType === "NOSO" && result.data.copyAttachmentsFromId) {
            console.log("attempting to copy attachments...");
            try {
              const data = await copyAttachments(result.data);
              docs.push(data);
            } catch (error) {
              console.error("There was an error with copying attachements:", error);
            }
          } else {
            docs.push(result.data);
          }
        } else {
          console.log(
            `Skipping package with invalid format for type "${record.adminChangeType}"`,
            result.error.message,
          );
        }
      }
      // If we're not a mako event, continue
      // TODO:  handle legacy.  for now, just continue
      if (!record.event || record?.origin !== "mako") {
        continue;
      }

      // If the event is a supported event, transform and push to docs array for indexing
      if (record.event in transforms) {
        const transformForEvent = transforms[record.event as keyof typeof transforms];

        const result = transformForEvent.transform(offset).safeParse(record);

        if (result.success && result.data === undefined) continue;
        if (!result.success) {
          logError({
            type: ErrorType.VALIDATION,
            error: result?.error,
            metadata: { topicPartition, kafkaRecord, record },
          });
          continue;
        }
        docs.push(result.data);
      } else {
        console.log(`No transform found for event: ${record.event}`);
      }
    } catch (error) {
      logError({
        type: ErrorType.BADPARSE,
        error,
        metadata: { topicPartition, kafkaRecord },
      });
    }
  }

  await bulkUpdateDataWrapper(docs, "changelog");
};
