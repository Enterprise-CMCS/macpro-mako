import { Handler } from "aws-lambda";
import { decode } from "base-64";
import * as os from "./../../../libs/opensearch-lib";
import { opensearch } from "shared-types";
import { KafkaEvent } from "shared-types";
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
    transform: opensearch.types.spa_type,
  },
  Type: {
    index: "subtypes",
    transform: opensearch.subtypes.type,
  },
};

export const handler: Handler<KafkaEvent> = async (event) => {
  for (const recordKey of Object.keys(event.records)) {
    const tableName = getTableName(recordKey);

    const docs: any = [];
    for (const kafkaRecord of event.records[recordKey]) {
      const { key, value } = kafkaRecord;
      try {
        const id: string = JSON.parse(decode(key));
        const record = JSON.parse(decode(value)).payload.after;
        if (!record) {
          console.log("delete detected... TODO:  handle deletes");
          continue;
        }
        const result = tables[tableName].transform(id).safeParse(record);
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
      await os.bulkUpdateData(osDomain, tables[tableName].index, docs);
    } catch (error) {
      console.error(error);
    }
  }
};
