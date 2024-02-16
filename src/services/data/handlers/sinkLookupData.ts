import { Handler } from "aws-lambda";
import { decode } from "base-64";
import * as os from "./../../../libs/opensearch-lib";
import { KafkaRecord, opensearch } from "shared-types";
import { KafkaEvent } from "shared-types";

const osDomain: string =
  process.env.osDomain ||
  (() => {
    throw new Error("ERROR: process.env.osDomain is required");
  })();

export const getTableName = (recordKey: string) => {
  return recordKey.split(".").pop()?.split("-").slice(0, -1).join("-") || "";
};

export const handler: Handler<KafkaEvent> = async (event) => {
  for (const recordKey of Object.keys(event.records)) {
    const tableName = getTableName(recordKey);
    switch (tableName) {
      case "SPA_Type":
        console.log("would process type records");
        await typeIndexer(event.records[recordKey]);
        break;
      case "Type":
        console.log("would process sub type records");
        await subtypeIndexer(event.records[recordKey]);
        break;
      default:
        console.log(`ERROR:  Unknown topic event source ${recordKey}`);
    }
  }
};

export const typeIndexer = async (records: KafkaRecord[]) => {
  const docs: any = [];
  for (const kafkaRecord of records) {
    const { value } = kafkaRecord;
    try {
      const record = JSON.parse(decode(value)).payload.after;
      if (!record) {
        console.log("delete detected... TODO:  handle deletes");
        continue;
      }
      const result = opensearch.types.spa_type.transform().safeParse(record);
      if (!result.success) {
        console.log(
          "TYPES Validation Error. The following record failed to parse: ",
          JSON.stringify(record),
          "Because of the following Reason(s):",
          result.error.message
        );
      } else {
        docs.push(result.data);
      }
    } catch (error) {
      console.log(
        `ERROR UKNOWN:  An unknown error occurred.  Loop continuing.  Error:  ${error}`
      );
    }
  }
  try {
    await os.bulkUpdateData(osDomain, "types", docs);
  } catch (error) {
    console.error(error);
  }
};

export const subtypeIndexer = async (records: KafkaRecord[]) => {
  const docs: any = [];
  for (const kafkaRecord of records) {
    const { value } = kafkaRecord;
    try {
      const record = JSON.parse(decode(value)).payload.after;
      if (!record) {
        console.log("delete detected... TODO:  handle deletes");
        continue;
      }
      const result = opensearch.subtypes.type.transform().safeParse(record);
      if (!result.success) {
        console.log(
          "SUBTYPES Validation Error. The following record failed to parse: ",
          JSON.stringify(record),
          "Because of the following Reason(s):",
          result.error.message
        );
      } else {
        docs.push(result.data);
      }
    } catch (error) {
      console.log(
        `ERROR UKNOWN:  An unknown error occurred.  Loop continuing.  Error:  ${error}`
      );
    }
  }
  try {
    await os.bulkUpdateData(osDomain, "subtypes", docs);
  } catch (error) {
    console.error(error);
  }
};
