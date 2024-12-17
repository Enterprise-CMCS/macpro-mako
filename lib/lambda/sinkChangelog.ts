import { Handler } from "aws-lambda";
import { decodeBase64WithUtf8 } from "shared-utils";
import { KafkaEvent, KafkaRecord, opensearch } from "shared-types";
import {
  ErrorType,
  bulkUpdateDataWrapper,
  getTopic,
  logError,
} from "../libs/sink-lib";
import { Index } from "shared-types/opensearch";
import {
  deleteAdminChangeSchema,
  updateIdAdminChangeSchema,
  updateValuesAdminChangeSchema,
} from "./update/adminChangeSchemas";
import { getPackageChangelog } from "lib/libs/api/package";
const osDomain = process.env.osDomain;
if (!osDomain) {
  throw new Error("Missing required environment variable(s)");
}
const index: Index = `${process.env.indexNamespace}changelog`;

// One notable difference between this handler and sinkMain's...
// The order in which records are processed for the changelog doesn't matter.
// Because each event is a unique record, and so there is no upserting, order doesn't matter.
export const handler: Handler<KafkaEvent> = async (event) => {
  const loggableEvent = { ...event, records: "too large to display" };
  try {
    for (const topicPartition of Object.keys(event.records)) {
      const topic = getTopic(topicPartition);
      switch (topic) {
        case undefined:
          logError({ type: ErrorType.BADTOPIC });
          throw new Error();
        case "aws.onemac.migration.cdc":
          // await legacyAdminChanges(
          //   event.records[topicPartition],
          //   topicPartition,
          // );
          // await onemac(event.records[topicPartition], topicPartition);
          await processAndIndex({
            kafkaRecords: event.records[topicPartition],
            index,
            osDomain,
            transforms: opensearch.changelog.transforms,
            topicPartition: topicPartition,
          });
          break;
      }
    }
  } catch (error) {
    logError({ type: ErrorType.UNKNOWN, metadata: { event: loggableEvent } });
    throw error;
  }
};

const processAndIndex = async ({
  kafkaRecords,
  index,
  osDomain,
  transforms,
  topicPartition,
}: {
  kafkaRecords: KafkaRecord[];
  index: Index;
  osDomain: string;
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

      const transformedDeleteSchema = deleteAdminChangeSchema.transform((data) => ({
        ...data,
        event: "delete",
        packageId: data.id,
        id: `${data.id}-${offset}`,
        timestamp: Date.now(),
      }));

      const transformedUpdateValuesSchema = updateValuesAdminChangeSchema.transform((data) => ({
        ...data,
        event: "update-values",
        packageId: data.id,
        id: `${data.id}-${offset}`,
        timestamp: Date.now(),
      }));

      const transformedUpdateIdSchema = updateIdAdminChangeSchema.transform((data) => ({
        ...data,
        event: "update-id",
        packageId: data.id,
        id: `${data.id}`,
        timestamp: Date.now(),
      }));

      const schema = transformedDeleteSchema
        .or(transformedUpdateValuesSchema)
        .or(transformedUpdateIdSchema);

      // TODO: query all changelog entries for this ID and create copies of all entries with new ID
      if (record.isAdminChange) {
        const result = schema.safeParse(record);

        if (result.success) {
          console.log("DOCS BEFORE", docs);
          if (result.data.adminChangeType === "update-id") {
            docs.forEach((log) => {
              const recordOffset = log.id.split("-").at(-1);
              docs.push({
                ...log._source,
                id: `${result.data.id}-${recordOffset}`,
                packageId: result.data.id,
              });
            });

            const packageChangelogs = await getPackageChangelog(result.data.idToBeUpdated);
            console.log("WHAT IS THIS", result.data.idToBeUpdated);
            console.log("PACKAGECHANGELOGS", packageChangelogs.hits.hits);

            packageChangelogs.hits.hits.forEach((log) => {
              const recordOffset = log._id.split("-").at(-1);
              console.log("RESULT ID", result.data.id);
              console.log("RECORD OFFSET", recordOffset);
              docs.push({
                ...log._source,
                id: `${result.data.id}-${recordOffset}`,
                packageId: result.data.id,
              });
            });
            console.log("DOCS", docs);
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
        console.log(JSON.stringify(result.data, null, 2));
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

  // Send all transformed records for indexing
  await bulkUpdateDataWrapper(osDomain, index, docs);
};

// const onemac = async (kafkaRecords: KafkaRecord[], topicPartition: string) => {
//   let docs: any[] = [];
//   for (const kafkaRecord of kafkaRecords) {
//     const { key, value, offset, timestamp } = kafkaRecord;
//     try {
//       // Skip delete events
//       if (!value) continue;

//       // Set id
//       const id: string = decodeBase64WithUtf8(key);

//       // Parse event data
//       const record = JSON.parse(decodeBase64WithUtf8(value));

//       // Process legacy events
//       if (record?.origin !== "mako") {
//         // Skip if it's not a submission event with a good GSIpk
//         if (
//           record?.sk === "Package" ||
//           !record.GSI1pk?.startsWith("OneMAC#submit")
//         ) {
//           continue;
//         }
//         const result = opensearch.changelog.legacyEvent
//           .transform(id)
//           .safeParse(record);

//         if (result.success && result.data === undefined) continue;

//         // Log Error and skip if transform had an error
//         if (!result?.success) {
//           logError({
//             type: ErrorType.VALIDATION,
//             error: result?.error,
//             metadata: { topicPartition, kafkaRecord, record },
//           });
//           continue;
//         }

//         // If we made it this far, we push the document to the docs array so it gets indexed
//         docs.push(result.data);
//       }

//       // Process micro events
//       if (record?.origin === "mako") {
//         // Resolve actionType
//         const actionType = record.actionType || "new-submission";

//         // Push to docs so it can be indexed, with some differences if app k
//         if (actionType === Action.UPDATE_ID) {
//           console.log("UPDATE_ID detected...");
//           await bulkUpdateDataWrapper(osDomain, index, docs);
//           docs = [];
//           const items = await os.search(osDomain, index, {
//             from: 0,
//             size: 200,
//             query: {
//               bool: {
//                 must: [{ term: { "packageId.keyword": id } }],
//               },
//             },
//           });
//           if (items === undefined || items.hits.hits === undefined) {
//             continue;
//           }
//           const modifiedHits: opensearch.changelog.Document[] =
//             items.hits.hits.map(
//               (hit: { _source: opensearch.changelog.Document }) => {
//                 return {
//                   ...hit._source,
//                   id: `${record.newId}-${hit._source.id.split("-").pop()}`,
//                   packageId: record.newId,
//                 };
//               },
//             );
//           docs.push(...modifiedHits);
//           docs.push({
//             ...record,
//             id: `${record.newId}-${offset}`,
//             packageId: record.newId,
//             oldPackageId: id,
//             newPackageId: record.newId,
//             timestamp,
//             actionType,
//           });
//           continue;
//         }
//         if (actionType === Action.REMOVE_APPK_CHILD) {
//           docs.push(
//             {
//               ...record,
//               id: `${record.appkParentId}-${offset}`,
//               packageId: record.appkParentId,
//               appkChildId: record.id,
//               timestamp,
//               actionType,
//             },
//             {
//               ...record,
//               id: `${record.id}-${offset}`,
//               appkParentId: record.appkParentId,
//               packageId: record.id,
//               timestamp,
//               actionType,
//             },
//           );
//           continue;
//         }
//         docs.push({
//           ...record,
//           id: `${id}-${offset}`,
//           packageId: id,
//           timestamp,
//           actionType,
//         });
//       }
//     } catch (error) {
//       logError({
//         type: ErrorType.BADPARSE,
//         error,
//         metadata: { topicPartition, kafkaRecord },
//       });
//     }
//   }
//   await bulkUpdateDataWrapper(osDomain, index, docs);
// };

// const legacyAdminChanges = async (
//   kafkaRecords: KafkaRecord[],
//   topicPartition: string,
// ) => {
//   const docs: any[] = [];
//   for (const kafkaRecord of kafkaRecords) {
//     const { key, value } = kafkaRecord;
//     try {
//       // Skip delete events
//       if (!value) continue;

//       // Set id
//       const id: string = decodeBase64WithUtf8(key);

//       // Parse event data
//       const record = JSON.parse(decodeBase64WithUtf8(value));

//       // Process legacy events
//       if (record?.origin !== "mako") {
//         // Skip if it's not a package view from onemac with adminChanges
//         if (
//           !(
//             record?.sk === "Package" &&
//             record.submitterName &&
//             record.adminChanges
//           )
//         ) {
//           continue;
//         }
//         for (const adminChange of record.adminChanges) {
//           const result = opensearch.changelog.legacyAdminChange
//             .transform(id)
//             .safeParse(adminChange);

//           if (result.success && result.data === undefined) continue;

//           // Log Error and skip if transform had an error
//           if (!result?.success) {
//             logError({
//               type: ErrorType.VALIDATION,
//               error: result?.error,
//               metadata: { topicPartition, kafkaRecord, record },
//             });
//             continue;
//           }

//           // If we made it this far, we push the document to the docs array so it gets indexed
//           docs.push(result.data);
//         }
//       }
//     } catch (error) {
//       logError({
//         type: ErrorType.BADPARSE,
//         error,
//         metadata: { topicPartition, kafkaRecord },
//       });
//     }
//   }
//   await bulkUpdateDataWrapper(osDomain, index, docs);
// };
