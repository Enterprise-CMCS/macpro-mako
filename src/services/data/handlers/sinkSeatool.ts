import { Handler } from "aws-lambda";
import { decode } from "base-64";
import * as os from "./../../../libs/opensearch-lib";
import { opensearch } from "shared-types";
import { KafkaEvent } from "shared-types";

const osDomain: string =
  process.env.osDomain ||
  (() => {
    throw new Error("ERROR: process.env.osDomain is required");
  })();

export const handler: Handler<KafkaEvent> = async (event) => {
  await seatool_main(event);
};

const subtypeCache: { [key: number]: string | null } = {};
const getSubtype = async (id: number) => {
  if (!id) return null;
  if (!subtypeCache[id]) {
    const item = await os.getItem(osDomain, "subtypes", id.toString());
    subtypeCache[id] = item?._source.name;
  }
  return subtypeCache[id];
};

const typeCache: { [key: number]: string | null } = {};
const getType = async (id: number) => {
  if (!id) return null;
  if (!typeCache[id]) {
    const item = await os.getItem(osDomain, "types", id.toString());
    typeCache[id] = item?._source.name;
  }
  return typeCache[id];
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
          flavor: null,
          actionType: null,
          actionTypeId: null,
          approvedEffectiveDate: null,
          changedDate: null,
          description: null,
          finalDispositionDate: null,
          leadAnalystName: null,
          leadAnalystOfficerId: null,
          authority: null,
          authorityId: null,
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
        console.log(`SEATOOL DELETE EVENT:  ${id}`);
        continue;
      }

      // Handle everything else
      const record = { id, ...JSON.parse(decode(value)) };
      const result = opensearch.main.seatool.transform(id).safeParse(record);
      if (!result.success) {
        console.log(
          "SEATOOL Validation Error. The following record failed to parse: ",
          JSON.stringify(record),
          "Because of the following Reason(s):",
          result.error.message
        );
      } else {
        const validAuthorityIds = [122, 123, 124, 125];
        if (
          result.data.authorityId &&
          validAuthorityIds.includes(result.data.authorityId) &&
          result.data.seatoolStatus
        ) {
          const type = result.data.typeId
            ? await getType(result.data.typeId)
            : null;
          const subType = result.data.subTypeId
            ? await getSubtype(result.data.subTypeId)
            : null;
          records[id] = { ...result.data, type, subType };
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
