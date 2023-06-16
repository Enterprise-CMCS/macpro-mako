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
            id: JSON.parse(decode(key)),
            isTombstone: true,
          });
        } else {
          records.push({
            id: JSON.parse(decode(key)),
            ...JSON.parse(decode(value)),
          });
        }
      }
    );
  }
  try {
    if (!process.env.tableName) {
      throw "process.env.tableName cannot be undefined";
    }

    for await (const item of records) {
      if (item.isTombstone) {
        deleteItem({ tableName: process.env.tableName, key: { id: item.id } });
      } else {
        putItem({
          tableName: process.env.tableName,
          item,
        });
      }
    }
  } catch (error) {
    console.error(error);
  }
};
