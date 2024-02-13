import { Handler } from "aws-lambda";
import { decode } from "base-64";
import * as os from "./../../../libs/opensearch-lib";
import { KafkaRecord, opensearch } from "shared-types";
import { KafkaEvent } from "shared-types";

const osDomain: string =
  process.env.osDomain ||
  (() => {
    throw new Error("ERROR: process.env.osDomain is required");
  })();

export const getTableName = (recordKey:string) => {
  return recordKey.split(".").pop()?.split("-").slice(0, -1).join("-") || "";
};

export const handler: Handler<KafkaEvent> = async (event) => {
  for (const recordKey of Object.keys(event.records)) {
    const tableName = getTableName(recordKey);
    switch(tableName) {
      case "State_Plan":
        console.log("would process ksqldb state_plan records");
        await State_PlanIndexer(event.records[recordKey]);
        break;
      case "State_Plan_Service_Types":
        console.log("would process State_Plan_Service_Types records (submission types)");
        await State_Plan_Service_TypesIndexer(event.records[recordKey]);
        break;
      case "State_Plan_Service_SubTypes":
        console.log("would process State_Plan_Service_SubTypes records (submission subtypes)");
        await State_Plan_Service_SubTypesIndexer(event.records[recordKey]);
        break;
      default:
        console.log(`ERROR:  Unknown topic event source ${recordKey}`);
    }
  }
};

export const State_PlanIndexer = async(records: KafkaRecord[]) => {
  await seatool_main(records);
  await seatool_seatool(records);
};

export const State_Plan_Service_TypesIndexer = async(records: KafkaRecord[]) => {
  console.log("Would process a State_Plan_Service_Types record");
  const docs: any = [];
  for (const kafkaRecord of records) {
    const { key, value } = kafkaRecord;
    try {
      const id: string = JSON.parse(decode(key));
      if (!value) {
        console.log("delete detected... no need to delete service type data");
        continue;
      }
      const record = JSON.parse(decode(value)).payload.after;
      const result = opensearch.main.state_plan_service_types.transform(id).safeParse(record);
      if (!result.success) {
        console.log(
          "TYPES Validation Error. The following record failed to parse: ",
          JSON.stringify(record),
          "Because of the following Reason(s):",
          result.error.message
        );
      } else {
        const type = result.data.typeId ? await getType(result.data.typeId) : null;
        docs.push({...result.data, type});
      }
    } catch(error) {
      console.log(`ERROR UKNOWN:  An unknown error occurred.  Loop continuing.  Error:  ${error}`);
      console.log(JSON.stringify(kafkaRecord,null,2));
      continue;
    } 
  }
};

export const State_Plan_Service_SubTypesIndexer = async(records: KafkaRecord[]) => {
  console.log("Would process a State_Plan_Service_SubTypes record");
  const docs: any = [];
  for (const kafkaRecord of records) {
    const { key, value } = kafkaRecord;
    try {
      const id: string = JSON.parse(decode(key));
      if (!value) {
        console.log("delete detected... no need to delete service type data");
        continue;
      }
      const record = JSON.parse(decode(value)).payload.after;
      const result = opensearch.main.state_plan_service_subtypes.transform(id).safeParse(record);
      if (!result.success) {
        console.log(
          "TYPES Validation Error. The following record failed to parse: ",
          JSON.stringify(record),
          "Because of the following Reason(s):",
          result.error.message
        );
      } else {
        const subtype = result.data.subtypeId ? await getSubtype(result.data.subtypeId) : null;
        docs.push({...result.data, subtype});
      }
    } catch(error) {
      console.log(`ERROR UKNOWN:  An unknown error occurred.  Loop continuing.  Error:  ${error}`);
      console.log(JSON.stringify(kafkaRecord,null,2));
      continue;
    } 
  }
};

const subtypeCache: { [key: number]: string | null } = {};
const getSubtype = async (id: number) => {
  if(!id) return null;
  if(!subtypeCache[id]){
    const item = await os.getItem(osDomain,"subtypes",id.toString());
    subtypeCache[id] = item?._source.name;
  }
  return subtypeCache[id];
};

const typeCache: { [key: number]: string | null } = {};
const getType = async (id: number) => {
  if(!id) return null;
  if(!typeCache[id]){
    const item = await os.getItem(osDomain,"types",id.toString());
    typeCache[id] = item?._source.name;
  }
  return typeCache[id];
};

export const seatool_main = async (rawRecords: KafkaRecord[]) => {
  const docs: any[] = [];
  const records: any = {};

  for (const seatoolRecord of rawRecords) {
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
        validAuthorityIds.includes(result.data.authorityId)
      ) {
          records[id] = result.data;
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

export const seatool_seatool = async (rawRecords: KafkaRecord[]) => {
    const docs: any[] = [];
    rawRecords.forEach((REC) => {
      // omit delete event
      if (!REC.value) return;

      const id = decode(REC.key);
      const record = JSON.parse(decode(REC.value));
      docs.push({
        ...record,
        id,
      });
    });
  try {
    await os.bulkUpdateData(osDomain, "seatool", docs);
  } catch (error) {
    console.error(error);
  }
};
