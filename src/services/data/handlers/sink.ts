import { Handler } from "aws-lambda";
import { decode } from "base-64";
import * as os from "./../../../libs/opensearch-lib";
import { SeaToolTransform, transformSeatoolData } from "shared-types/seatool";
import { OneMacTransform, transformOnemac } from "shared-types/onemac";
if (!process.env.osDomain) {
  throw "ERROR:  process.env.osDomain is required,";
}
import { ZodError } from "zod";
const osDomain: string = process.env.osDomain;
const index = "main";

export const seatool: Handler = async (event) => {
  const seaToolRecords: SeaToolTransform[] = [];

  for (const recordKey of Object.keys(event.records)) {
    for (const seatoolRecord of event.records[recordKey] as {
      key: string;
      value: string;
    }[]) {
      const { key, value } = seatoolRecord;
      const id: string = JSON.parse(decode(key));
      console.log("seatool id is: ", id);
      const record = { id, ...JSON.parse(decode(value)) };

      // we need to handle the case of null records for value
      // this is a delete event so we will need to delete
      if (value) {
        try {
          const validPlanTypeIds = [122, 123, 124, 125];
          const transformedRecord = transformSeatoolData(id).parse(record);

          if (validPlanTypeIds.includes(transformedRecord.planTypeId)) {
            seaToolRecords.push(transformedRecord);
          }
        } catch (err: unknown) {
          if (err instanceof ZodError) {
            console.log("SeaTool validation failed: ", err.message);
          } else {
            console.log("A non validation error occured: ", err);
          }
        }
      }
    }
  }

  try {
    for (const item of seaToolRecords) {
      await os.updateData(osDomain, {
        index,
        id: item.id,
        body: {
          doc: item,
          doc_as_upsert: true,
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
};

export const onemac: Handler = async (event) => {
  const oneMacRecords: OneMacTransform[] = [];

  for (const recordKey of Object.keys(event.records)) {
    for (const onemacRecord of event.records[recordKey] as {
      key: string;
      value: string;
    }[]) {
      const { key, value } = onemacRecord;
      const id: string = decode(key);
      console.log("onemac id is: ", id);
      const record = { id, ...JSON.parse(decode(value)) };

      if (value && record && record.sk === "Package") {
        try {
          const transformedRecord = transformOnemac(id).parse(record);
          oneMacRecords.push(transformedRecord);
        } catch (err: unknown) {
          if (err instanceof ZodError) {
            console.log("OneMac validation failed", err.message);
          } else {
            console.log("A non-validation error occured: ", err);
          }
        }
      }
    }
  }

  try {
    for (const item of oneMacRecords) {
      await os.updateData(osDomain, {
        index,
        id: item.id,
        body: {
          doc: item,
          doc_as_upsert: true,
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
};
