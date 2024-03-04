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
const index = "main";

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
            ...(await onemac(event.records[topicPartition], topicPartition))
          );
          break;
        case "aws.seatool.ksql.onemac.agg.State_Plan":
          docs.push(
            ...(await ksql(event.records[topicPartition], topicPartition))
          );
          break;
        case "aws.seatool.debezium.changed_date.SEA.dbo.State_Plan":
          docs.push(
            ...(await changed_date(
              event.records[topicPartition],
              topicPartition
            ))
          );
          break;
      }
    }
    try {
      await os.bulkUpdateData(osDomain, index, docs);
    } catch (error: any) {
      logError({ type: ErrorType.BULKUPDATE });
      throw error;
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
      const validAuthorityIds = [122, 123, 124, 125];
      if (
        result.data.authorityId &&
        validAuthorityIds.includes(result.data.authorityId) &&
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
  return docs;
};

const onemac = async (kafkaRecords: KafkaRecord[], topicPartition: string) => {
  const docs: any[] = [];
  for (const kafkaRecord of kafkaRecords) {
    const { key, value } = kafkaRecord;
    try {
      const id: string = decode(key);

      // Handle deletes and continue
      if (!value) {
        docs.push(opensearch.main.legacySubmission.tombstone(id));
        continue;
      }
      const record = JSON.parse(decode(value));
      // Handle legacy and continue
      if (record?.origin !== "micro") {
        if (
          record?.sk === "Package" && // Is a Package View
          record?.submitterName && // Is originally from Legacy
          record?.submitterName !== "-- --" // Is originally from Legacy
        ) {
          const result = opensearch.main.legacySubmission
            .transform(id)
            .safeParse(record);
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
      const result = (() => {
        switch (record?.actionType) {
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
            return opensearch.main.withdrawRai.transform(id).safeParse(record);
          case Action.WITHDRAW_PACKAGE:
            return opensearch.main.withdrawPackage
              .transform(id)
              .safeParse(record);
          case Action.REMOVE_APPK_CHILD:
            return opensearch.main.removeAppkChild
              .transform(id)
              .safeParse(record);
        }
      })();
      if (result === undefined) {
        console.log(
          `no action to take for ${id} action ${record.actionType}.  Continuing...`
        );
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

const changed_date = async (
  kafkaRecords: KafkaRecord[],
  topicPartition: string
) => {
  const docs: any[] = [];
  for (const kafkaRecord of kafkaRecords) {
    const { value } = kafkaRecord;
    try {
      const decodedValue = Buffer.from(value, "base64").toString("utf-8");
      const record = JSON.parse(decodedValue).payload.after;
      if (!record) {
        continue;
      }
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
  return docs;
};
