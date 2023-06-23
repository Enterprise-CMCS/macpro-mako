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

          const StateAbbreviation = jsonRecord?.["STATES"]?.[0]?.["STATE_CODE"];
          const PlanType = jsonRecord?.["PLAN_TYPES"]?.[0]?.["PLAN_TYPE_NAME"];
          const SubmissionDate =
            jsonRecord?.["STATE_PLAN"]?.["SUBMISSION_DATE"];

          const record = {
            ID: JSON.parse(decode(key)),
            ...jsonRecord,
          };

          if (StateAbbreviation) {
            record.StateAbbreviation = StateAbbreviation;
          }

          if (PlanType) {
            record.PlanType = PlanType;
          }

          if (SubmissionDate) {
            record.SubmissionDate = SubmissionDate;
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
