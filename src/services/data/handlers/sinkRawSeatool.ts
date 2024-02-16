import { Handler } from "aws-lambda";
import { decode } from "base-64";
import * as os from "./../../../libs/opensearch-lib";
import { KafkaEvent } from "shared-types";

const osDomain: string =
  process.env.osDomain ||
  (() => {
    throw new Error("ERROR: process.env.osDomain is required");
  })();

export const handler: Handler<KafkaEvent> = async (event) => {
  const data = Object.values(event.records).reduce((ACC, RECORDS) => {
    RECORDS.forEach((REC) => {
      // omit delete event
      if (!REC.value) return;

      const id = decode(REC.key);
      const record = JSON.parse(decode(REC.value));
      ACC.push({
        ...record,
        id,
      });
    });

    return ACC;
  }, [] as any[]);

  try {
    await os.bulkUpdateData(osDomain, "seatool", data);
  } catch (error) {
    console.error(error);
  }
};
