import { Handler } from "aws-lambda";
import { decode } from "base-64";
import * as os from "./../../../libs/opensearch-lib";
import {
  SeaToolRecordsToDelete,
  SeaToolTransform,
  transformSeatoolData,
  transformOnemac,
  transformOnemacLegacy,
  transformRaiIssue,
  transformRaiResponse,
  transformRaiWithdraw,
  transformWithdrawPackage,
  transformToggleWithdrawRaiEnabled,
  Action,
} from "shared-types";

type Event = {
  /**
   * @example "SelfManagedKafka"
   */
  eventSource: string;
  /**
   * @example: "b-1.master-msk.zf7e0q.c7.kafka.us-east-1.amazonaws.com:9094,b-2.master-msk.zf7e0q.c7.kafka.us-east-1.amazonaws.com:9094,b-3.master-msk.zf7e0q.c7.kafka.us-east-1.amazonaws.com:9094"
   */
  bootstrapServers: string; // comma separated string
  records: Record<
    string,
    {
      topic: string;
      partition: number;
      offset: number;
      timestamp: number;
      timestampType: string;
      key: string;
      headers: string[];
      value: string;
    }[]
  >;
};

if (!process.env.osDomain) {
  throw "ERROR:  process.env.osDomain is required,";
}
const osDomain: string = process.env.osDomain;

export const seatool: Handler<Event> = async (event) => {
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
        if (!result.success) {
          console.log(
            "SEATOOL Validation Error. The following record failed to parse: ",
            JSON.stringify(record),
            "Because of the following Reason(s):",
            result.error.message
          );
        } else {
          if (
            result.data.planTypeId &&
            validPlanTypeIds.includes(result.data.planTypeId)
          ) {
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

export const onemacDataTransform = (props: { key: string; value?: string }) => {
  const id: string = decode(props.key);

  // is delete
  if (!props.value) {
    return {
      id,
      additionalInformation: null,
      raiWithdrawEnabled: null,
      attachments: null,
      submitterEmail: null,
      submitterName: null,
    };
  }

  const record = { id, ...JSON.parse(decode(props.value)) };

  // is Legacy
  const isLegacy = record?.origin !== "micro";
  if (isLegacy) {
    const notPackageView = record?.sk !== "Package";
    if (notPackageView) return null;

    const notOriginatingFromOnemacLegacy =
      !record.submitterName || record.submitterName === "-- --";
    if (notOriginatingFromOnemacLegacy) return null;

    const result = transformOnemacLegacy(id).safeParse(record);
    return result.success ? result.data : null;
  }

  // NOTE: Make official decision on initial type by MVP - timebomb
  const isNewRecord = !record?.actionType;
  if (isNewRecord) {
    const result = transformOnemac(id).safeParse(record);
    return result.success ? result.data : null;
  }

  // --------- Package-Actions ---------//
  // TODO: remove transform package-action below

  if (record.actionType === Action.ENABLE_RAI_WITHDRAW) {
    const result = transformToggleWithdrawRaiEnabled(id).safeParse(record);
    return result.success ? result.data : null;
  }

  if (record.actionType === Action.DISABLE_RAI_WITHDRAW) {
    const result = transformToggleWithdrawRaiEnabled(id).safeParse(record);
    return result.success ? result.data : null;
  }

  if (record.actionType === Action.ISSUE_RAI) {
    const result = transformRaiIssue(id).safeParse(record);
    return result.success ? result.data : null;
  }

  if (record.actionType === Action.RESPOND_TO_RAI) {
    const result = transformRaiResponse(id).safeParse(record);
    return result.success ? result.data : null;
  }

  if (record.actionType === Action.WITHDRAW_RAI) {
    const result = transformRaiWithdraw(id).safeParse(record);
    return result.success ? result.data : null;
  }

  if (record.actionType === Action.WITHDRAW_PACKAGE) {
    const result = transformWithdrawPackage(id).safeParse(record);
    return result.success ? result.data : null;
  }

  return null;
};

export const onemac_main = async (event: Event) => {
  const records = Object.values(event.records).reduce((ACC, RECORDS) => {
    RECORDS.forEach((REC) => {
      const dataTransform = onemacDataTransform(REC);
      if (!dataTransform) return;
      ACC.push(dataTransform);
    });

    return ACC;
  }, [] as any[]);

  try {
    await os.bulkUpdateData(osDomain, "main", records);
  } catch (error) {
    console.error(error);
  }
};

export const onemac_changelog = async (event: Event) => {
  const data = Object.values(event.records).reduce((ACC, RECORDS) => {
    RECORDS.forEach((REC) => {
      // omit delete event
      if (!REC.value) return;

      const record = JSON.parse(decode(REC.value));
      // omit legacy record
      if (record?.origin !== "micro") return;

      // include package actions
      const packageId = decode(REC.key);
      ACC.push({
        ...record,
        ...(!record?.actionType && { actionType: "new-submission" }), // new-submission custom actionType
        id: `${packageId}-${REC.offset}`,
        packageId,
      });
    });

    return ACC;
  }, [] as any[]);

  try {
    await os.bulkUpdateData(osDomain, "changelog", data);
  } catch (error) {
    console.error(error);
  }
};

export const onemac: Handler<Event> = async (event) => {
  await onemac_main(event);
  await onemac_changelog(event);
};
