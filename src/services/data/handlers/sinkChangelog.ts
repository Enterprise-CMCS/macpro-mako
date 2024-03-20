import { Handler } from "aws-lambda";
import { decode } from "base-64";
import * as os from "./../../../libs/opensearch-lib";
import { Action, KafkaRecord, opensearch } from "shared-types";
import { KafkaEvent } from "shared-types";
import { ErrorType, getTopic, logError } from "../libs/sink-lib";
const osDomain = process.env.osDomain;
if (!osDomain) {
  throw new Error("Missing required environment variable(s)");
}
const index = "changelog";

export const handler: Handler<KafkaEvent> = async (event) => {
  const loggableEvent = { ...event, records: "too large to display" };
  const docs: any[] = [];
  try {
    for (const topicPartition of Object.keys(event.records)) {
      const topic = getTopic(topicPartition);
      switch (topic) {
        case undefined:
          logError({ type: ErrorType.BADTOPIC });
          throw new Error();
        case "aws.onemac.migration.cdc":
          docs.push(
            ...(await onemac(event.records[topicPartition], topicPartition)),
            ...(await legacyAdminChanges(
              event.records[topicPartition],
              topicPartition,
            )),
          );
          break;
      }
    }
    try {
      await os.bulkUpdateData(osDomain, index, docs);
    } catch (error: any) {
      logError({
        type: ErrorType.BULKUPDATE,
        metadata: { event: loggableEvent },
      });
      throw error;
    }
  } catch (error) {
    logError({ type: ErrorType.UNKNOWN, metadata: { event: loggableEvent } });
    throw error;
  }
};

const onemac = async (kafkaRecords: KafkaRecord[], topicPartition: string) => {
  const docs: any[] = [];
  for (const kafkaRecord of kafkaRecords) {
    const { key, value, offset, timestamp } = kafkaRecord;
    try {
      // Skip delete events
      if (!value) continue;

      // Set id
      const id: string = decode(key);

      // Parse event data
      const record = JSON.parse(decode(value));

      // Process legacy events
      if (record?.origin !== "micro") {
        // Skip if it's not a submission event with a good GSIpk
        if (
          !(
            (
              record?.sk !== "Package" &&
              (record.GSI1pk?.startsWith("OneMAC#submit") ||
                record.GSI1pk?.startsWith("OneMAC#enable"))
            ) // i think the transforms switch should be brought here to avoid this stuff
          )
        ) {
          continue;
        }
        const result = opensearch.changelog.legacyEvent
          .transform(id, offset)
          .safeParse(record);

        // Log Error and skip if transform had an error
        if (!result?.success) {
          logError({
            type: ErrorType.VALIDATION,
            error: result?.error,
            metadata: { topicPartition, kafkaRecord, record },
          });
          continue;
        }

        // Skip if the transform had a nominal return of undefined
        if (result.data === undefined) continue;

        // If we made it this far, we push the document to the docs array so it gets indexed
        docs.push({ ...result.data, devOrigin: "legacy" });
      }

      // Process micro events
      if (record?.origin === "micro") {
        // Resolve actionType
        const actionType = record.actionType || "new-submission";

        // Push to docs so it can be indexed, with some differences if app k
        docs.push({
          ...record,
          id:
            actionType === Action.REMOVE_APPK_CHILD
              ? `${record.appkParentId}-${offset}`
              : `${id}-${offset}`,
          packageId:
            actionType === Action.REMOVE_APPK_CHILD ? record.appkParentId : id,
          appkChildId:
            actionType === Action.REMOVE_APPK_CHILD ? record.id : undefined,
          timestamp,
          actionType,
          devOrigin: "micro",
        });
      }
    } catch (error) {
      logError({
        type: ErrorType.BADPARSE,
        error,
        metadata: { topicPartition, kafkaRecord },
      });
    }
  }
  return docs;
};

const legacyAdminChanges = async (
  kafkaRecords: KafkaRecord[],
  topicPartition: string,
) => {
  const docs: any[] = [];
  for (const kafkaRecord of kafkaRecords) {
    const { key, value } = kafkaRecord;
    try {
      // Skip delete events
      if (!value) continue;

      // Set id
      const id: string = decode(key);

      // Parse event data
      const record = JSON.parse(decode(value));

      // Process legacy events
      if (record?.origin !== "micro") {
        // Skip if it's not a submission event with a good GSIpk and admin changes
        if (
          !(
            (
              record?.sk !== "Package" &&
              (record.GSI1pk?.startsWith("OneMAC#submit") ||
                record.GSI1pk?.startsWith("OneMAC#enable")) &&
              record.adminChanges &&
              record.adminChanges.length > 0
            ) // i think the transforms switch should be brought here to avoid this stuff
          )
        ) {
          continue;
        }
        for (const adminChange of record.adminChanges) {
          const result = opensearch.changelog.legacyAdminChange
            .transform(id)
            .safeParse(adminChange);

          // Skip if the transform had a nominal return of undefined
          if (result === undefined) continue;

          // Log Error and skip if transform had an error
          if (!result?.success) {
            logError({
              type: ErrorType.VALIDATION,
              error: result?.error,
              metadata: { topicPartition, kafkaRecord, record },
            });
            continue;
          }

          // If we made it this far, we push the document to the docs array so it gets indexed
          docs.push({ ...result.data, devOrigin: "legacy" });
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
  // // Since adminChanges are a materialized view within an event record, we deduplicate to avoid overloading the opensearch bulk update
  // return filterAndMapDocuments(docs);
  return docs;
};

// function filterAndMapDocuments(documents: Document[]): any[] {
//   // Reduce the array to an object where each key is a document ID and the value is the document itself.
//   // This will ensure each ID is unique and only the last document with the same ID is kept.
//   const lastEntries = documents.reduce<{ [id: string]: Document }>(
//     (acc, doc) => {
//       acc[doc.id] = doc; // This will overwrite any previous entry with the same ID
//       return acc;
//     },
//     {},
//   );

//   // Convert the object back into an array of documents
//   const filteredDocuments = Object.values(lastEntries);

//   // Assuming you want to perform some mapping on the filtered documents,
//   // but since it's not specified what the mapping should do, I'm leaving the flatMap part with a comment.
//   // Please adjust it to your needs.
//   const body = filteredDocuments.flatMap((doc) => [
//     // Perform your mapping here. For example, return the document itself or transform it as needed.
//     doc,
//     // More transformations or additional items related to 'doc' can be added here.
//   ]);

//   return body;
// }
