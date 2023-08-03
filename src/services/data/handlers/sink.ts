import { Handler } from "aws-lambda";
import { decode } from "base-64";
import * as os from "./../../../libs/opensearch-lib";
import { transformSeatoolData } from "shared-types/seatool";
if (!process.env.osDomain) {
  throw "ERROR:  process.env.osDomain is required,";
}
const osDomain: string = process.env.osDomain;
const index = "main";

type ProgramType = "WAIVER" | "MEDICAID" | "CHIP" | "UNKNOWN";

function sortAndExtractReceivedDate(arr: any) {
  // Sort the array by RAI_REQUESTED_DATE in ascending order
  arr.sort((a, b) => a.RAI_REQUESTED_DATE - b.RAI_REQUESTED_DATE);

  return arr[arr.length - 1].RAI_RECEIVED_DATE;
}

function getLeadAnalyst(eventData) {
  if (
    eventData.LEAD_ANALYST &&
    Array.isArray(eventData.LEAD_ANALYST) &&
    eventData.STATE_PLAN.LEAD_ANALYST_ID
  ) {
    const leadAnalyst = eventData.LEAD_ANALYST.find(
      (analyst) => analyst.OFFICER_ID === eventData.STATE_PLAN.LEAD_ANALYST_ID
    );
    console.log("the lead analsyt is: ", leadAnalyst);

    if (leadAnalyst) return leadAnalyst; // {FIRST_NAME: string, LAST_NAME: string}
  }
  return null;
}

export const seatool: Handler = async (event) => {
  const records: Record<string, unknown>[] = [];
  for (const key in event.records) {
    event.records[key].forEach(
      ({ key, value }: { key: string; value: string }) => {
        const id: string = JSON.parse(decode(key));
        if (!value) {
          // handle delete somehow
        } else {
          const record = { ...JSON.parse(decode(value)) };
          const transformedSeaToolData = transformSeatoolData(id).parse(record);
          // const rai_received_date = record?.["RAI"]
          //   ? sortAndExtractReceivedDate(record?.["RAI"])
          //   : null;
          records.push({
            key: id,
            value: transformedSeaToolData,
          });
        }
      }
    );
  }
  console.log(records);
  console.log("yepyep");
  try {
    for (const item of records) {
      await os.updateData(osDomain, {
        index,
        id: item.key,
        body: {
          doc: item.value,
          doc_as_upsert: true,
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
};

const getProgramType = (record: { componentType: string }) => {
  let type: ProgramType = "UNKNOWN";
  if (record.componentType.includes("waiver")) type = "WAIVER";
  if (record.componentType.includes("medicaid")) type = "MEDICAID";
  if (record.componentType.includes("chip")) type = "CHIP";

  return type;
};
export const onemac: Handler = async (event) => {
  const records: Record<string, unknown>[] = [];
  for (const key in event.records) {
    event.records[key].forEach(
      ({ key, value }: { key: string; value: string }) => {
        const id: string = decode(key);
        if (!value) {
          records.push({
            key: id,
            value: {
              onemac: null,
            },
          });
        } else {
          const record = { ...JSON.parse(decode(value)) };

          if (record.sk !== "Package") {
            console.log("Not a package type - ignoring");
            return;
          }
          const programType = getProgramType(record);

          if (
            record.proposedEffectiveDate &&
            !(record.proposedEffectiveDate instanceof Date)
          ) {
            record.proposedEffectiveDate = null;
          }

          if (
            record.finalDispositionDate &&
            !(record.finalDispositionDate instanceof Date)
          ) {
            record.finalDispositionDate = null;
          }

          records.push({
            key: id,
            value: {
              programType,
              [programType]: record,
            },
          });
        }
      }
    );
  }
  try {
    for (const item of records) {
      await os.updateData(osDomain, {
        index,
        id: item.key,
        body: {
          doc: item.value,
          doc_as_upsert: true,
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
};
