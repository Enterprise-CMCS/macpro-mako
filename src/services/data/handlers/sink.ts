import { Handler } from "aws-lambda";
import { decode } from "base-64";
import * as os from "./../../../libs/opensearch-lib";
import { SeaToolTransform, transformSeatoolData } from "shared-types/seatool";
import { OneMacTransform, transformOnemac } from "shared-types/onemac";
if (!process.env.osDomain) {
  throw "ERROR:  process.env.osDomain is required,";
}
const osDomain: string = process.env.osDomain;

export const seatool: Handler = async (event) => {
  const seaToolRecords: SeaToolTransform[] = [];
  const docObject: Record<string, SeaToolTransform> = {};
  const rawArr: any[] = [];

  for (const recordKey of Object.keys(event.records)) {
    for (const seatoolRecord of event.records[recordKey] as {
      key: string;
      value: string;
    }[]) {
      const { key, value } = seatoolRecord;

      // we need to handle the case of null records for value
      // this is a delete event so we will need to delete
      if (value) {
        const id: string = JSON.parse(decode(key));
        const record = { id, ...JSON.parse(decode(value)) };

        const validPlanTypeIds = [122, 123, 124, 125];
        const result = transformSeatoolData(id).safeParse(record);
        if (result.success === false) {
          console.log(
            "SEATOOL Validation Error. The following record failed to parse: ",
            JSON.stringify(record),
            "Because of the following Reason(s):",
            result.error.message
          );
        } else {
          if (validPlanTypeIds.includes(result.data.planTypeId)) {
            docObject[id] = result.data;
          }
          rawArr.push(record);
        }
      }
    }
  }
  for (const [, b] of Object.entries(docObject)) {
    seaToolRecords.push(b);
  }
  try {
    await os.bulkUpdateData(osDomain, "main", seaToolRecords);
    await os.bulkUpdateData(osDomain, "seatool", rawArr);
  } catch (error) {
    console.error(error);
  }
};

export const onemac: Handler = async (event) => {
  const oneMacRecords: OneMacTransform[] = [];
  const docObject: Record<string, OneMacTransform> = {};

  for (const recordKey of Object.keys(event.records)) {
    for (const onemacRecord of event.records[recordKey] as {
      key: string;
      value: string;
    }[]) {
      const { key, value } = onemacRecord;

      if (value) {
        const id: string = decode(key);
        const record = { id, ...JSON.parse(decode(value)) };
        if (record && record.sk === "Package") {
          const result = transformOnemac(id).safeParse(record);
          if (result.success === false) {
            console.log(
              "ONEMAC Validation Error. The following record failed to parse: ",
              JSON.stringify(record),
              "Because of the following Reason(s):",
              result.error.message
            );
          } else {
            docObject[id] = result.data;
          }
        }
      }
    }
  }
  for (const [, b] of Object.entries(docObject)) {
    oneMacRecords.push(b);
  }
  try {
    await os.bulkUpdateData(osDomain, "main", oneMacRecords);
  } catch (error) {
    console.error(error);
  }
};
