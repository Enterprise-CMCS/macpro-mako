import { Handler } from "aws-lambda";
import { decode } from "base-64";
import * as os from "./../../../libs/opensearch-lib";
import {
  SeaToolRecordsToDelete,
  SeaToolTransform,
  transformSeatoolData,
} from "shared-types/seatool";
import {
  OneMacRecordsToDelete,
  OneMacTransform,
  transformOnemac,
  RaiIssueTransform,
  transformRaiIssue,
  RaiResponseTransform,
  transformRaiResponse,
} from "shared-types/onemac";
import {
  Action,
  withdrawRecordSchema,
  WithdrawRecord,
  withdrawRaiSchema,
} from "shared-types";

if (!process.env.osDomain) {
  throw "ERROR:  process.env.osDomain is required,";
}
const osDomain: string = process.env.osDomain;

export const seatool: Handler = async (event) => {
  const seaToolRecords: (SeaToolTransform | SeaToolRecordsToDelete)[] = [];
  const docObject: Record<string, SeaToolTransform | SeaToolRecordsToDelete> =
    {};
  const rawArr: any[] = [];

  for (const recordKey of Object.keys(event.records)) {
    for (const seatoolRecord of event.records[recordKey] as {
      key: string;
      value: string;
    }[]) {
      const { key, value } = seatoolRecord;

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
      } else {
        // to handle deletes
        const id: string = JSON.parse(decode(key));
        const seaTombstone: SeaToolRecordsToDelete = {
          id,
          actionType: null,
          actionTypeId: null,
          approvedEffectiveDate: null,
          authority: null,
          changedDate: null,
          leadAnalystName: null,
          leadAnalystOfficerId: null,
          planType: null,
          planTypeId: null,
          proposedDate: null,
          raiReceivedDate: null,
          raiRequestedDate: null,
          state: null,
          cmsStatus: null,
          stateStatus: null,
          seatoolStatus: null,
          submissionDate: null,
        };

        docObject[id] = seaTombstone;

        console.log(
          `Record ${id} has been nullified with the following data: `,
          JSON.stringify(seaTombstone)
        );
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
  const oneMacRecords: (
    | OneMacTransform
    | OneMacRecordsToDelete
    | (WithdrawRecord & { id: string })
    | RaiIssueTransform
    | RaiResponseTransform
  )[] = [];

  for (const recordKey of Object.keys(event.records)) {
    for (const onemacRecord of event.records[recordKey] as {
      key: string;
      value: string;
    }[]) {
      const { key, value } = onemacRecord;

      if (value) {
        const id: string = decode(key);
        const record = { id, ...JSON.parse(decode(value)) };
        const isActionType = "actionType" in record;
        if (isActionType) {
          switch (record.actionType) {
            case Action.ENABLE_RAI_WITHDRAW:
            case Action.DISABLE_RAI_WITHDRAW: {
              const result = withdrawRecordSchema.safeParse(record);
              if (result.success) {
                // write to opensearch
                // account for compaction
                oneMacRecords.push({
                  id,
                  ...result.data,
                });
              } else {
                console.log(
                  `ERROR: Invalid Payload for this action type (${record.actionType})`
                );
              }
              break;
            }
            case Action.ISSUE_RAI: {
              const result = transformRaiIssue(id).safeParse(record);
              if (result.success) {
                oneMacRecords.push(result.data);
              } else {
                console.log(
                  `ERROR: Invalid Payload for this action type (${record.actionType})`
                );
              }
              break;
            }
            case Action.RESPOND_TO_RAI: {
              console.log("RESPONDING");
              const result = transformRaiResponse(id).safeParse(record);
              if (result.success) {
                console.log(result.data);
                oneMacRecords.push(result.data);
              } else {
                console.log(
                  `ERROR: Invalid Payload for this action type (${record.actionType})`
                );
              }
              break;
            }
            case Action.WITHDRAW_RAI: {
              console.log("WITHDRAWING RAI");
              const result = withdrawRaiSchema.safeParse({ id, ...record });

              if (result.success === true) {
                oneMacRecords.push(record);
              } else {
                console.log(
                  `ERROR: Invalid Payload for this action type (${record.actionType})`
                );
              }
              break;
            }
          }
        } else if (
          record && // testing if we have a record
          (record.origin === "micro" || // testing if this is a micro record
            (record.sk === "Package" && // testing if this is a legacy onemac package record
              record.submitterName &&
              record.submitterName !== "-- --"))
        ) {
          const result = transformOnemac(id).safeParse(record);
          if (result.success === false) {
            console.log(
              "ONEMAC Validation Error. The following record failed to parse: ",
              JSON.stringify(record),
              "Because of the following Reason(s):",
              result.error.message
            );
          } else {
            oneMacRecords.push(result.data);
          }
        }
      } else {
        const id: string = decode(key);
        const oneMacTombstone: OneMacRecordsToDelete = {
          id,
          additionalInformation: null,
          raiWithdrawEnabled: null,
          attachments: null,
          submitterEmail: null,
          submitterName: null,
          origin: null,
        };

        oneMacRecords.push(oneMacTombstone);

        console.log(
          `Record ${id} has been nullified with the following data: `,
          JSON.stringify(oneMacTombstone)
        );
      }
    }
  }
  try {
    await os.bulkUpdateData(osDomain, "main", oneMacRecords);
  } catch (error) {
    console.error(error);
  }
};
