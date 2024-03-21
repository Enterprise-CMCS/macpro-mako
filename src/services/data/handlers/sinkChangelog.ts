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
          .transform(id)
          .safeParse(record);

        if (result.success && result.data === undefined) continue;

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
        // Skip if it's not a package view from onemac with adminChanges
        if (
          !(
            record?.sk === "Package" &&
            record.submitterName &&
            record.adminChanges
          )
        ) {
          continue;
        }
        for (const adminChange of record.adminChanges) {
          const result = opensearch.changelog.legacyAdminChange
            .transform(id)
            .safeParse(adminChange);

          if (result.success && result.data === undefined) continue;

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
  return docs;
};
