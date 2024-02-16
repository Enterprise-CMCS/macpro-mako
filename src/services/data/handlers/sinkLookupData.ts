import { Handler } from "aws-lambda";
import * as os from "./../../../libs/opensearch-lib";
import { KafkaEvent, opensearch } from "shared-types";
import { Index } from "shared-types/opensearch";

const osDomain: string =
  process.env.osDomain ||
  (() => {
    throw new Error("ERROR: process.env.osDomain is required");
  })();

export const getTableName = (recordKey: string) => {
  return recordKey.split(".").pop()?.split("-").slice(0, -1).join("-") || "";
};

const tables: {
  [key: string]: {
    index: Index;
    transform: any;
  };
} = {
  SPA_Type: {
    index: "types",
    transform: opensearch.types.SPA_Type.transform,
  },
  Type: {
    index: "subtypes",
    transform: opensearch.subtypes.Type.transform,
  },
};

export const handler: Handler<KafkaEvent> = async (event) => {
  for (const recordKey of Object.keys(event.records)) {
    const tableName = getTableName(recordKey);
    if (!(tableName in tables)) {
      throw new Error(`Unknown table: ${tableName}`);
    }
    const { index, transform } = tables[tableName];
    const docs: any = [];
    for (const kafkaRecord of event.records[recordKey]) {
      const { key, value } = kafkaRecord;
      try {
        const decodedValue = Buffer.from(value, "base64").toString("utf-8");
        const record = JSON.parse(decodedValue).payload.after;
        if (!record) {
          console.log("delete detected... TODO:  handle deletes");
          continue;
        }
        const result = transform().safeParse(record);
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
      await os.bulkUpdateData(osDomain, index, docs);
    } catch (error) {
      console.error(error);
    }
  }
};
