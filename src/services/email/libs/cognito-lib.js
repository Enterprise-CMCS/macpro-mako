export const getCognitoData = async (id) => {
    try {
      // if (!process.env.osDomain) {
      //   throw new Error("process.env.osDomain must be defined");
      // }
  
      // const osInsightsItem = await os.getItem(
      //   process.env.osDomain,
      //   "insights",
      //   id
      // );
      // console.log("The OpenSearch Item index Insights for %s is: ", id, JSON.stringify(osInsightsItem, null, 4));
      // const cpoc = osInsightsItem?._source?.LEAD_ANALYST ? osInsightsItem._source.LEAD_ANALYST : "LEAD_ANALYST IS null?";
      // const srt = osInsightsItem?._source?.ACTION_OFFICERS ? osInsightsItem._source.ACTION_OFFICERS : "ACTION_OFFICERS IS null?";
      // console.log("CPOC and SRT are: ", cpoc, srt);
      // if (osInsightsItem) return "'CPOC Insights' <k.grue.cmsapprover@gmail.com>;'SRT Insights' <k.grue.stateadmn@gmail.com>";
      return `'${id} State 1' <k.grue.stateuser@gmail.com>;'${id} State 2' <k.grue.stateadmn@gmail.com>`;
    } catch (error) {
      console.log("Cognito error is: ", error);
    }
  };