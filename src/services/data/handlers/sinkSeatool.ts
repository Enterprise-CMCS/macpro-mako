import { Handler } from "aws-lambda";
import { decode } from "base-64";
import * as os from "./../../../libs/opensearch-lib";
import * as main from "shared-types/opensearch/main";
import { KafkaEvent } from "shared-types";

const osDomain: string =
  process.env.osDomain ||
  (() => {
    throw new Error("ERROR: process.env.osDomain is required");
  })();

export const handler: Handler<KafkaEvent> = async (event) => {
  await seatool_main(event);
  await seatool_seatool(event);
};

export const seatool_main = async (event: KafkaEvent) => {
  const docs: any[] = [];
  const records: any = {};

  for (const recordKey of Object.keys(event.records)) {
    for (const seatoolRecord of event.records[recordKey]) {
      const { key, value } = seatoolRecord;
      const id: string = JSON.parse(decode(key));

      // Handle deletes and return
      if (!value) {
        records[id] = {
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
        return;
      }

      // Handle everything else
      const record = { id, ...JSON.parse(decode(value)) };
      const result = main.transforms.seatool(id).safeParse(record);
      if (!result.success) {
        console.log(
          "SEATOOL Validation Error. The following record failed to parse: ",
          JSON.stringify(record),
          "Because of the following Reason(s):",
          result.error.message
        );
      } else {
        const validPlanTypeIds = [122, 123, 124, 125];
        if (
          result.data.planTypeId &&
          validPlanTypeIds.includes(result.data.planTypeId)
        ) {
          records[id] = result.data;
        }
      }
    }
  }
  for (const [, b] of Object.entries(records)) {
    docs.push(b);
  }
  try {
    await os.bulkUpdateData(osDomain, "main", docs);
  } catch (error) {
    console.error(error);
  }
};

export const seatool_seatool = async (event: KafkaEvent) => {
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
