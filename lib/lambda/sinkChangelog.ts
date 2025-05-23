import { Handler } from "aws-lambda";
import { getPackageChangelog } from "libs/api/package";
import { bulkUpdateDataWrapper, ErrorType, getTopic, logError } from "libs/sink-lib";
import { KafkaEvent, KafkaRecord, LegacyAdminChange, opensearch } from "shared-types";
import { decodeBase64WithUtf8 } from "shared-utils";

import {
  legacyEventIdUpdateSchema,
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
function extractIds(input: string): { beforeId: string; afterId: string } | null {
  const regex = /from\s+([^\s]+)\s+to\s+([^\s]+)/;
  const match = input.match(regex);

  if (match && match.length >= 3) {
    return {
      beforeId: match[1],
      afterId: match[2],
    };
  }

  return null;
}
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
      console.log(JSON.stringify(record, null, 2));
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
                _id: `${id}-${recordOffset}`,
                packageId: id,
                deleted: false,
                ...restOfResultData,
              });
            });

            // Get all changelog entries for the original package ID
            // Filter out any entry regarding the soft deleted event
            // Create copies of the rest of the changelog entries with the new package ID
            const packageChangelogs = await getPackageChangelog(idToBeUpdated);
            console.log("package change logs: " + JSON.stringify(packageChangelogs));
            console.log("old ID" + idToBeUpdated);
            console.log("new iD" + id);
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
            console.log(docs);
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
          } else if (result.data.adminChangeType === "delete") {
            const { packageId } = result.data;
            const packageChangelogs = await getPackageChangelog(packageId);

            packageChangelogs.hits.hits.forEach((log) => {
              if (log._source.event !== "delete") {
                docs.push({
                  ...log._source,
                  packageId: packageId + "-del",
                });
                console.log(JSON.stringify(docs));
              }
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
        const schema = legacyEventIdUpdateSchema;
        const result = schema.safeParse(record);

        // Check if event has admin changes and then only use the most recent.
        // Take that ID then use it to get the changelogs to update by comparing timestamps
        // Mark all the packageIDs with the offset and Del to get rid of them from use
        if (result.success && result.data.adminChanges) {
          const { adminChanges: adminChanges } = result.data;
          const adminChange = adminChanges[0];
          const ids = extractIds(adminChange.changeMade);
          if (ids) {
            const changelogs = await getPackageChangelog(ids.beforeId);

            for (const changelog of changelogs.hits.hits) {
              const recordOffset = changelog._source.timestamp;
              const origID = changelog._id;
              const source = changelog._source;
              if (source.timestamp <= adminChange.changeTimestamp) {
                docs.push(
                  { ...source, id: `${ids.afterId}-${recordOffset}`, packageId: ids.afterId },
                  { ...source, id: origID, packageId: `${ids.beforeId}-del` },
                );
              }
            }
            const copyDocs: Array<(typeof transforms)[keyof typeof transforms]["Schema"]> = [];
            for (const record of docs) {
              if (
                record.packageId === ids.beforeId &&
                record.timestamp <= adminChange.changeTimestamp
              ) {
                copyDocs.push({
                  ...record,
                  id: `${ids.afterId}-${record.timestamp}`,
                  packageId: ids.afterId,
                });
                record.packageId += "-del";
              }
            }
            docs.push(...copyDocs);
          }
        }

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
  console.log("docs before upload: " + JSON.stringify(docs));
  await bulkUpdateDataWrapper(docs, "changelog");
};
