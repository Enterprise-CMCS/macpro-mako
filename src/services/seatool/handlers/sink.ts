import { Handler } from "aws-lambda";
import { putItem } from "../../../libs";
import { decode } from "base-64";

export const handler: Handler = async (event) => {
  const records: { id: string; value: any }[] = [];
  for (const key in event.records) {
    event.records[key].forEach(
      ({ key, value }: { key: string; value: string }) => {
        // TODO: if value is null, delete instead of put
        records.push({
          id: JSON.parse(decode(key)),
          ...JSON.parse(decode(value)),
        });
      }
    );
  }
  try {
    if (!process.env.tableName) {
      throw "process.env.tableName cannot be undefined";
    }

    for await (const item of records) {
      putItem({
        tableName: process.env.tableName,
        item,
      });
    }
  } catch (error) {
    console.error(error);
  }
};
