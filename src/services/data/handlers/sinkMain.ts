import { Handler } from "aws-lambda";
import { decode } from "base-64";
import * as os from "./../../../libs/opensearch-lib";
import { Action, KafkaRecord, opensearch } from "shared-types";
import { KafkaEvent } from "shared-types";
import {
  ErrorType,
  bulkUpdateDataWrapper,
  getTopic,
  logError,
} from "../libs/sink-lib";
const osDomain = process.env.osDomain;
if (!osDomain) {
  throw new Error("Missing required environment variable(s)");
}
const index = "main";

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
          await onemac(event.records[topicPartition], topicPartition);
          break;
        case "aws.seatool.ksql.onemac.agg.State_Plan":
          await ksql(event.records[topicPartition], topicPartition);
          break;
        case "aws.seatool.debezium.changed_date.SEA.dbo.State_Plan":
          await changed_date(event.records[topicPartition], topicPartition);
          break;
      }
    }
  } catch (error) {
    logError({ type: ErrorType.UNKNOWN, metadata: { event: loggableEvent } });
    throw error;
  }
};

const ksql = async (kafkaRecords: KafkaRecord[], topicPartition: string) => {
  const docs: any[] = [];
  for (const kafkaRecord of kafkaRecords) {
    const { key, value } = kafkaRecord;
    try {
      const id: string = JSON.parse(decode(key));

      // Handle deletes and continue
      if (!value) {
        docs.push(opensearch.main.seatool.tombstone(id));
        continue;
      }

      // Handle everything else and continue
      const record = {
        id,
        ...JSON.parse(decode(value)),
      };
      const result = opensearch.main.seatool.transform(id).safeParse(record);
      if (!result.success) {
        logError({
          type: ErrorType.VALIDATION,
          error: result?.error,
          metadata: { topicPartition, kafkaRecord, record },
        });
        continue;
      }
      if (
        result.data.authorityId &&
        typeof result.data.seatoolStatus === "string" &&
        result.data.seatoolStatus != "Unknown"
      ) {
        docs.push({ ...result.data });
      }
    } catch (error) {
      logError({
        type: ErrorType.BADPARSE,
        error,
        metadata: { topicPartition, kafkaRecord },
      });
    }
  }
  await bulkUpdateDataWrapper(osDomain, index, docs);
};

const onemac = async (kafkaRecords: KafkaRecord[], topicPartition: string) => {
  let docs: any[] = [];
  for (const kafkaRecord of kafkaRecords) {
    const { key, value } = kafkaRecord;
    try {
      const id: string = decode(key);

      // Handle deletes and continue
      if (!value) {
        docs.push(opensearch.main.legacyPackageView.tombstone(id));
        continue;
      }
      const record = JSON.parse(decode(value));
      // Process legacy events
      if (record?.origin !== "micro") {
        // Is a Package View from legacy onemac
        if (record?.sk === "Package" && record.submitterName) {
          const result = opensearch.main.legacyPackageView
            .transform(id)
            .safeParse(record);
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
        }
        continue;
      }

      // Handle everything else
      if (record.origin === "micro") {
        const result = await (async () => {
          switch (record?.actionType) {
            case "new-submission":
            case undefined:
              return opensearch.main.newSubmission
                .transform(id)
                .safeParse(record);
            case Action.DISABLE_RAI_WITHDRAW:
            case Action.ENABLE_RAI_WITHDRAW:
              return opensearch.main.toggleWithdrawEnabled
                .transform(id)
                .safeParse(record);
            case Action.WITHDRAW_RAI:
              return opensearch.main.withdrawRai
                .transform(id)
                .safeParse(record);
            case Action.WITHDRAW_PACKAGE:
              return opensearch.main.withdrawPackage
                .transform(id)
                .safeParse(record);
            case Action.REMOVE_APPK_CHILD:
              return opensearch.main.removeAppkChild
                .transform(id)
                .safeParse(record);
            case Action.UPDATE_ID: {
              console.log("UPDATE_ID detected...");
              // Immediately index all prior documents
              await bulkUpdateDataWrapper(osDomain, index, docs);
              // Reset docs back to empty
              docs = [];
              const item = await os.getItem(osDomain, index, id);
              if (item === undefined) {
                return {
                  error: "An error occured parsing the event.",
                  success: null,
                };
              }

              // Copy record with new id
              if (item.actionType && item.actionType === "Extend") {
                // if it's a TE, we want all the data
                docs.push({ ...item, id: record.newId });
              } else {
                // if it's not a TE, we exclude the seatool derived data
                docs.push({
                  id: record.newId,
                  appkParentId: item._source.appkParentId,
                  origin: item._source.origin,
                  raiWithdrawEnabled: item._source.raiWithdrawEnabled,
                  submitterName: item._source.submitterName,
                  submitterEmail: item._source.submitterEmail,
                });
              }
              // Remove the record from our dashboard
              docs.push({
                id,
                origin: null,
              });

              return undefined;
            }
          }
        })();
        if (result === undefined) {
          continue;
        }
        if (!result?.success) {
          logError({
            type: ErrorType.VALIDATION,
            error: result?.error,
            metadata: { topicPartition, kafkaRecord, record },
          });
          continue;
        }
        docs.push(result.data);
        continue;
      }
    } catch (error) {
      logError({
        type: ErrorType.BADPARSE,
        error,
        metadata: { topicPartition, kafkaRecord },
      });
    }
  }
  await bulkUpdateDataWrapper(osDomain, index, docs);
};

const changed_date = async (
  kafkaRecords: KafkaRecord[],
  topicPartition: string,
) => {
  const docs: any[] = [];
  for (const kafkaRecord of kafkaRecords) {
    const { key, value } = kafkaRecord;
    try {
      // Set id
      const id: string = JSON.parse(decode(key)).payload.ID_Number;

      // Handle delete events and continue
      if (value === undefined) {
        continue;
      }

      // Parse record
      const decodedValue = Buffer.from(value, "base64").toString("utf-8");
      const record = JSON.parse(decodedValue).payload.after;

      // Handle tombstone events and continue
      if (!record) continue;

      const result = opensearch.main.changedDate.transform().safeParse(record);
      if (!result.success) {
        logError({
          type: ErrorType.VALIDATION,
          error: result?.error,
          metadata: { topicPartition, kafkaRecord, record },
        });
        continue;
      }
      docs.push(result.data);
    } catch (error) {
      logError({
        type: ErrorType.BADPARSE,
        error,
        metadata: { topicPartition, kafkaRecord },
      });
    }
  }
  await bulkUpdateDataWrapper(osDomain, index, docs);
};
