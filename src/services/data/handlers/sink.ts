import { Handler } from "aws-lambda";
import { decode } from "base-64";
import * as os from "./../../../libs/opensearch-lib";
if (!process.env.osDomain) {
  throw "ERROR:  process.env.osDomain is required,";
}
const osDomain: string = process.env.osDomain;
const index = "main";

export const seatool: Handler = async (event) => {
  const records: Record<string, unknown>[] = [];
  for (const key in event.records) {
    event.records[key].forEach(
      ({ key, value }: { key: string; value: string }) => {
        const id: string = JSON.parse(decode(key));
        if (!value) {
          records.push({
            key: id,
            value: {
              seatool: null,
            },
          });
        } else {
          const record = { ...JSON.parse(decode(value)) };
          const STATE_CODE = record?.["STATES"]?.[0]?.["STATE_CODE"];
          const PLAN_TYPE = record?.["PLAN_TYPES"]?.[0]?.["PLAN_TYPE_NAME"];
          const SUBMISSION_DATE = record?.["STATE_PLAN"]?.["SUBMISSION_DATE"];

          if (STATE_CODE) {
            record.STATE_CODE = STATE_CODE;
          }

          if (PLAN_TYPE) {
            record.PLAN_TYPE = PLAN_TYPE;
          }

          if (SUBMISSION_DATE) {
            record.SUBMISSION_DATE = SUBMISSION_DATE;
          }

          records.push({
            key: id,
            value: {
              seatool: record,
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

type ProgramType = "WAIVER" | "MEDICAID" | "CHIP" | "UNKNOWN";

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
