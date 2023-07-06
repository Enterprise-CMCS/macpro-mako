import { Handler } from "aws-lambda";
import { deleteItem, putItem } from "../../../libs";
import { decode } from "base-64";

export const handler: Handler = async (event) => {
  const records: Record<string, unknown>[] = [];
  for (const key in event.records) {
    event.records[key].forEach(
      ({ key, value }: { key: string; value: string }) => {
        if (!value) {
          records.push({
            ID: JSON.parse(decode(key)),
            isTombstone: true,
          });
        } else {
          const jsonRecord = { ...JSON.parse(decode(value)) };

          const STATE_CODE = jsonRecord?.["STATES"]?.[0]?.["STATE_CODE"];
          const PLAN_TYPE = jsonRecord?.["PLAN_TYPES"]?.[0]?.["PLAN_TYPE_NAME"];
          const SUBMISSION_DATE =
            jsonRecord?.["STATE_PLAN"]?.["SUBMISSION_DATE"];

          const record = {
            ID: JSON.parse(decode(key)),
            ...jsonRecord,
          };

          if (STATE_CODE) {
            record.STATE_CODE = STATE_CODE;
          }

          if (PLAN_TYPE) {
            record.PLAN_TYPE = PLAN_TYPE;
          }

          if (SUBMISSION_DATE) {
            record.SUBMISSION_DATE = SUBMISSION_DATE;
          }

          records.push(record);
        }
      }
    );
  }
  try {
    if (!process.env.tableName) {
      throw "process.env.tableName cannot be undefined";
    }

    for (const item of records) {
      if (item.isTombstone) {
        await deleteItem({
          tableName: process.env.tableName,
          key: { ID: item.ID },
        });
      } else {
        await putItem({
          tableName: process.env.tableName,
          item,
        });
      }
    }
  } catch (error) {
    console.error(error);
  }
};
