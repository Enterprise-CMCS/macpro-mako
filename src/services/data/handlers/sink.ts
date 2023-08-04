import { Handler } from "aws-lambda";
import { decode } from "base-64";
import * as os from "./../../../libs/opensearch-lib";
import { transformSeatoolData } from "shared-types/seatool";
if (!process.env.osDomain) {
  throw "ERROR:  process.env.osDomain is required,";
}
import s3ParseUrl from "s3-url-parser";
const osDomain: string = process.env.osDomain;
const index = "main";

type ProgramType = "WAIVER" | "MEDICAID" | "CHIP" | "UNKNOWN";

function sortAndExtractReceivedDate(
  arr: {
    RAI_REQUESTED_DATE: number;
    RAI_RECEIVED_DATE: number;
  }[]
) {
  // Sort the array by RAI_REQUESTED_DATE in ascending order
  arr.sort((a, b) => a.RAI_REQUESTED_DATE - b.RAI_REQUESTED_DATE);

  return arr[arr.length - 1].RAI_RECEIVED_DATE;
}

// This is not good
function getProgramType(planTypeId: number) {
  let type: ProgramType = "UNKNOWN";
  switch (planTypeId) {
    case 124:
      type = "CHIP";
      break;
    case 125:
      type = "MEDICAID";
      break;
    case 122:
    case 123:
      type = "WAIVER";
      break;
    default:
      type = "UNKNOWN";
      break;
  }
  return type;
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
          const planTypeId = record?.STATE_PLAN?.PLAN_TYPE;
          const rai_received_date = record?.["RAI"]
            ? sortAndExtractReceivedDate(record?.["RAI"])
            : null;
          console.log(planTypeId);
          switch (planTypeId) {
            case 124:
            case 125:
              // These are spas
              eventData.id = id;
              eventData.programType = getProgramType(planTypeId);
              eventData.planTypeId = planTypeId;
              eventData.planType = planTypeLookup[planTypeId];
              eventData.authority = "SPA";
              eventData.state = record?.["STATES"]?.[0]?.["STATE_CODE"] || null;
              eventData.submission_date =
                record?.["STATE_PLAN"]?.["SUBMISSION_DATE"] || null;
              eventData.rai_received_date = rai_received_date || null;
              eventData.status =
                record?.SPW_STATUS?.[0].SPW_STATUS_DESC || null;
              eventData.leadAnalyst = getLeadAnalyst(eventData);
              eventData.proposedDate =
                record?.["STATE_PLAN"]?.["PROPOSED_DATE"] || null;
              eventData.approvedEffectiveDate =
                record?.["STATE_PLAN"]?.["APPROVED_EFFECTIVE_DATE"] || null;
              eventData.changedDate =
                record?.["STATE_PLAN"]?.["CHANGED_DATE"] || null;
              break;
            case 122:
            case 123:
              // These are waivers
              eventData.id = id;
              eventData.programType = getProgramType(planTypeId);
              eventData.planTypeId = planTypeId;
              eventData.planType = planTypeLookup[planTypeId];
              eventData.authority = "WAIVER";
              eventData.state = record?.["STATES"]?.[0]?.["STATE_CODE"] || null;
              eventData.submission_date =
                record?.["STATE_PLAN"]?.["SUBMISSION_DATE"] || null;
              eventData.rai_received_date = rai_received_date || null;
              eventData.status =
                record?.SPW_STATUS?.[0].SPW_STATUS_DESC || null;
              eventData.leadAnalyst = getLeadAnalyst(eventData);
              break;
            default:
              // This is not something we're concerned with
              break;
          }
          if (Object.keys(eventData).length) {
            records.push({
              key: id,
              value: eventData,
            });
          }
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

export const onemac: Handler = async (event) => {
  const records: Record<string, unknown>[] = [];
  for (const key in event.records) {
    event.records[key].forEach(
      ({ key, value }: { key: string; value: string }) => {
        const id: string = decode(key);
        const eventData: Record<any, any> = {};
        if (!value) {
          // handle delete somehow
        } else {
          const record = { ...JSON.parse(decode(value)) };

          if (record.sk !== "Package") {
            console.log("Not a package type - ignoring");
            return;
          }
          eventData.attachments = record.attachments || null;
          if (record.attachments && Array.isArray(record.attachments)) {
            eventData.attachments = record.attachments.map((attachment) => {
              const uploadDate = parseInt(attachment.s3Key.split("/")[0]);
              delete attachment.s3Key; // Once we have the date, this value is useless to us.  It's not the actual key
              const { bucket, key } = s3ParseUrl(attachment.url);
              return {
                ...attachment,
                uploadDate,
                bucket,
                key,
              };
            });
          }
          eventData.additionalInformation =
            record.additionalInformation || null;
          eventData.submitterName = record.submitterName || null;
          eventData.submitterEmail = record.submitterEmail || null;
          eventData.submissionOrigin = "OneMAC";
          if (Object.keys(eventData).length) {
            records.push({
              key: id,
              value: eventData,
            });
          }
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
