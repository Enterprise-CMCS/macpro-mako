import { Handler } from "aws-lambda";
import { getPackageChangelog } from "libs/api/package";
import { bulkUpdateDataWrapper, ErrorType, getTopic, logError } from "libs/sink-lib";
import { KafkaEvent, KafkaRecord, LegacyAdminChange, opensearch } from "shared-types";
import { decodeBase64WithUtf8 } from "shared-utils";

import {
  transformDeleteSchema,
  transformedSplitSPASchema,
  transformedUpdateIdSchema,
  transformSubmitValuesSchema,
  transformUpdateValuesSchema,
} from "./update/adminChangeSchemas";

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
    const { value, offset, headers } = kafkaRecord;
    const kafkaSource = String.fromCharCode(...(headers[0]?.source || []));
    try {
      // If a legacy tombstone, continue
      if (!value) {
        continue;
      }

      // Parse the kafka record's value
      const record = JSON.parse(decodeBase64WithUtf8(value));

      if (record.isAdminChange) {
        const schema = transformDeleteSchema(offset)
          .or(transformUpdateValuesSchema(offset))
          .or(transformedUpdateIdSchema)
          .or(transformedSplitSPASchema)
          .or(transformSubmitValuesSchema);

        const result = schema.safeParse(record);

        if (result.success) {
          if (result.data.adminChangeType === "update-id" && "idToBeUpdated" in result.data) {
            const { id, packageId: _packageId, idToBeUpdated, ...restOfResultData } = result.data;
            // Push doc with content of package being soft deleted
            docs.forEach((log) => {
              const recordOffset = log.id.split("-").at(-1);
              docs.push({
                ...log,
                id: `${id}-${recordOffset}`,
                packageId: id,
                deleted: false,
                ...restOfResultData,
              });
            });
            // Get all changelog entries for the original package ID
            // Filter out any entry regarding the soft deleted event
            // Create copies of the rest of the changelog entries with the new package ID
            const packageChangelogs = await getPackageChangelog(idToBeUpdated);

            packageChangelogs.hits.hits.forEach((log) => {
              if (log._source.event !== "delete") {
                const recordOffset = log._id.split("-").at(-1);
                docs.push({
                  ...log._source,
                  id: `${id}-${recordOffset}`,
                  packageId: id,
                });
              }
            });
          } else if (
            result.data.adminChangeType === "split-spa" &&
            "idToBeUpdated" in result.data
          ) {
            // Push doc with new split package
            docs.push({ ...result.data, proposedDate: null, submissionDate: null });
            // Get all changelog entries for this ID and create copies of all entries with new ID
            const packageChangelogs = await getPackageChangelog(result.data.idToBeUpdated);

            packageChangelogs.hits.hits.forEach((log) => {
              const recordOffset = log._id.split("-").at(-1);
              docs.push({
                ...log._source,
                id: `${result.data.id}-${recordOffset}`,
                packageId: result.data.id,
              });
            });
          } else {
            docs.push({ ...result.data, proposedDate: null, submissionDate: null });
          }
        } else {
          console.log(
            `Skipping package with invalid format for type "${record.adminChangeType}"`,
            result.error.message,
          );
        }
      }

      // If the event is a supported event, transform and push to docs array for indexing
      if (kafkaSource === "onemac" && record.GSI1pk?.startsWith("OneMAC#submit")) {
        // This is a onemac legacy event
        record.event = "legacy-event";
        record.origin = "onemac";
      }

      const recordsToProcess: Array<(typeof transforms)[keyof typeof transforms]["Schema"]> = [];
      if (record.adminChanges?.length) {
        record.adminChanges.map((adminChange: LegacyAdminChange) =>
          recordsToProcess.push({
            ...record,
            ...adminChange,
            event: "legacy-admin-change",
          }),
        );
      } else {
        recordsToProcess.push(record);
      }
      for (const currentRecord of recordsToProcess) {
        // If the event is a supported event, transform and push to docs array for indexing
        if (currentRecord.event in transforms) {
          const transformForEvent = transforms[currentRecord.event as keyof typeof transforms];

          const result = transformForEvent.transform(offset).safeParse(currentRecord);

          if (result.success && result.data === undefined) continue;
          if (!result.success) {
            logError({
              type: ErrorType.VALIDATION,
              error: result?.error,
              metadata: { topicPartition, kafkaRecord, currentRecord },
            });
            continue;
          }
          docs.push(result.data);
        } else {
          console.log(`No transform found for event: ${currentRecord.event}`);
        }
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
