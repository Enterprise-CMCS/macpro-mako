import * as os from "../../../libs/opensearch-lib";

const buildEmailsToSend = (officerList, officerId) =>
  officerList.map((officer) => {
    if (officerId && officer.OFFICER_ID !== officerId) return;
    if (!officer.EMAIL) return;
    return `"${officer.LAST_NAME}, ${officer.FIRST_NAME}" <${officer.EMAIL}>`;
  }).filter(Boolean).join(";");

export const getOsInsightData = async (id) => {
  let returnData = {};
  try {
    if (!process.env.osDomain) {
      throw new Error("process.env.osDomain must be defined");
    }

    const osInsightsItem = await os.getItem(
      process.env.osDomain,
      "insights",
      id
    );
    console.log("Insights Item: ", JSON.stringify(osInsightsItem, null, 4));
    returnData.cpoc = osInsightsItem?._source?.LEAD_ANALYST ? buildEmailsToSend(osInsightsItem?._source?.LEAD_ANALYST, osInsightsItem?._source?.STATE_PLAN.LEAD_ANALYST_ID) : "'CPOC Substitute' <mako.stateuser@gmail.com>";
    returnData.srt = osInsightsItem?._source?.ACTION_OFFICERS ? buildEmailsToSend(osInsightsItem?._source?.ACTION_OFFICERS) : "'SRT Substitute' <mako.stateuser@gmail.com>";
    returnData.ninetyDaysLookup = osInsightsItem?._source?.STATE_PLAN.ALERT_90_DAYS_DATE;

    // const osChangeLogItem = await os.search(process.env.osDomain, "changelog", {
    //   from: 0,
    //   size: 200,
    //   sort: [{ timestamp: "desc" }],
    //   query: {
    //     bool: {
    //       must: [{ term: { "packageId.keyword": id } }],
    //     },
    //   },
    // });
    // console.log("ChangeLog Items: ", JSON.stringify(osChangeLogItem, null, 4));

    // const osTypesItem = await os.getItem(
    //   process.env.osDomain,
    //   "types",
    //   id
    // );
    // console.log("osTypesItem Item: ", osTypesItem);

    // const osSubTypesItem = await os.getItem(
    //   process.env.osDomain,
    //   "subtypes",
    //   id
    // );
    // console.log("osSubTypesItem Item: ", osSubTypesItem);
    
  } catch (error) {
    console.log("OpenSearch error is: ", error);
  }
  console.log("OS Lookup ReturnData: ", returnData);
  return returnData;
};

export const getOsMainData = async (id) => {
  let returnData = {};
  try {
    if (!process.env.osDomain) {
      throw new Error("process.env.osDomain must be defined");
    }

    const osMainItem = await os.getItem(
      process.env.osDomain,
      "main",
      id
    );
    console.log("Main Item: ", osMainItem);
    
    returnData.initialSubmitterName = osMainItem?._source?.submitterName ? osMainItem._source.submitterName : "Submitter Unknown";
    returnData.initialSubmitterEmail = osMainItem?._source?.submitterEmail ? osMainItem._source.submitterEmail : "Submitter Email Unknown";

  } catch (error) {
    console.log("OpenSearch error is: ", error);
  }
  console.log("OS Main Lookup ReturnData: ", returnData);
  return returnData;
};