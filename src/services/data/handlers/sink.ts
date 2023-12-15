import { Handler } from "aws-lambda";
import { decode } from "base-64";
import * as os from "./../../../libs/opensearch-lib";
import {
  SeaToolRecordsToDelete,
  SeaToolTransform,
  transformSeatoolData,
  OnemacRecordsToDelete,
  OnemacLegacyRecordsToDelete,
  OnemacTransform,
  transformOnemac,
  OnemacLegacyTransform,
  transformOnemacLegacy,
  RaiIssueTransform,
  transformRaiIssue,
  RaiResponseTransform,
  transformRaiResponse,
  RaiWithdrawTransform,
  transformRaiWithdraw,
  ToggleWithdrawRaiEnabled,
  toggleWithdrawRaiEnabledSchema,
  Action,
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
          description: null,
          finalDispositionDate: null,
          leadAnalystName: null,
          leadAnalystOfficerId: null,
          planType: null,
          planTypeId: null,
          proposedDate: null,
          raiReceivedDate: null,
          raiRequestedDate: null,
          raiWithdrawnDate: null,
          reviewTeam: null,
          state: null,
          cmsStatus: null,
          stateStatus: null,
          seatoolStatus: null,
          statusDate: null,
          submissionDate: null,
          subject: null,
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
    | OnemacTransform
    | OnemacRecordsToDelete
    | OnemacLegacyTransform
    | OnemacLegacyRecordsToDelete
    | (ToggleWithdrawRaiEnabled & { id: string })
    | RaiIssueTransform
    | RaiResponseTransform
    | RaiWithdrawTransform
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
        console.log("THE RECORD:");
        console.log(JSON.stringify(record, null, 2));
        if (record?.origin == "micro") {
          console.log("MICRO EVENT");
          const isActionType = "actionType" in record;
          if (isActionType) {
            console.log("MICRO ACTION");
            switch (record.actionType) {
              case Action.ENABLE_RAI_WITHDRAW:
              case Action.DISABLE_RAI_WITHDRAW: {
                const result = toggleWithdrawRaiEnabledSchema.safeParse(record);
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
                console.log("Withdraw Record", record);

                const result = transformRaiWithdraw(id).safeParse(record);
                if (result.success === true) {
                  oneMacRecords.push({
                    ...result.data,
                    raiWithdrawEnabled: null,
                  });
                } else {
                  console.log(
                    `ERROR: Invalid Payload for this action type (${record.actionType})`
                  );
                  console.log(
                    "The error is the following: ",
                    result.error.message
                  );
                }
                break;
              }
            }
          } else {
            console.log("MICRO NEW SUBMISSION");
            // This is a micro submission
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
        } else if (
          record?.sk === "Package" && // testing if this is a legacy onemac package record
          record.submitterName &&
          record.submitterName !== "-- --"
        ) {
          // This is a legacy onemac package record
          const result = transformOnemacLegacy(id).safeParse(record);
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
        const oneMacTombstone: OnemacRecordsToDelete = {
          id,
          additionalInformation: null,
          raiWithdrawEnabled: null,
          attachments: null,
          submitterEmail: null,
          submitterName: null,
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
