import * as os from "../../../libs/opensearch-lib";

const buildEmailsToSend = (officerList, officerId) =>
  officerList.map((officer) => {
    if (officerId && officer.OFFICER_ID !== officerId) return;
    if (!officer.EMAIL) return;
    return `"${officer.LAST_NAME}, ${officer.FIRST_NAME}" <${officer.EMAIL}>`;
  }).filter(Boolean).join(';');

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
    console.log("The OpenSearch Item index Insights for %s is: ", id, JSON.stringify(osInsightsItem, null, 4));
    //      returnData.cpoc = osInsightsItem?._source?.LEAD_ANALYST ? osInsightsItem._source.LEAD_ANALYST : "LEAD_ANALYST IS null?";
    //        const cpocId = osInsightsItem?._source?.LEAD_ANALYST_ID;
    returnData.cpoc = osInsightsItem?._source?.LEAD_ANALYST ? buildEmailsToSend(osInsightsItem?._source?.LEAD_ANALYST, osInsightsItem?._source?.STATE_PLAN.LEAD_ANALYST_ID) : "'CPOC Substitute' <k.grue.cmsapprover@gmail.com>";
    returnData.srt = osInsightsItem?._source?.ACTION_OFFICERS ? buildEmailsToSend(osInsightsItem?._source?.ACTION_OFFICERS) : "'SRT Substitute' <k.grue.stateadmn@gmail.com>";
    returnData.ninetyDaysLookup = osInsightsItem?._source?.STATE_PLAN.ALERT_90_DAYS_DATE;
//    returnData.srt = osInsightsItem?._source?.ACTION_OFFICERS ? osInsightsItem._source.ACTION_OFFICERS : "ACTION_OFFICERS IS null?";
    // returnData.alertNinetyDaysTimestamp = 
    console.log("returnData is: ", returnData);
    return returnData;
    //   if (osInsightsItem) return "'CPOC Insights' <k.grue.cmsapprover@gmail.com>;'SRT Insights' <k.grue.stateadmn@gmail.com>";
    //   return "'CPOC Substitute' <k.grue.cmsapprover@gmail.com>;'SRT 1' <k.grue.stateadmn@gmail.com>";
  } catch (error) {
    console.log("OpenSearch error is: ", error);
  }
  return returnData;
};