import * as os from "../opensearch-lib";

interface Officer {
  OFFICER_ID: string;
  EMAIL: string;
  LAST_NAME: string;
  FIRST_NAME: string;
}

interface OsInsightsItem {
  _source?: {
    LEAD_ANALYST?: Officer[];
    STATE_PLAN?: {
      LEAD_ANALYST_ID?: string;
      ALERT_90_DAYS_DATE?: string;
    };
    ACTION_OFFICERS?: Officer[];
  };
}

interface OsMainItem {
  _source?: {
    submitterName?: string;
    submitterEmail?: string;
  };
}

const buildEmailsToSend = (
  officerList: Officer[],
  officerId?: string,
): string =>
  officerList
    .map((officer) => {
      if (officerId && officer.OFFICER_ID !== officerId) return null;
      if (!officer.EMAIL) return null;
      return `"${officer.LAST_NAME}, ${officer.FIRST_NAME}" <${officer.EMAIL}>`;
    })
    .filter(Boolean)
    .join(";");

export const getOsInsightData = async (
  id: string,
): Promise<{ [key: string]: any }> => {
  const returnData: { [key: string]: any } = {};
  try {
    if (!process.env.osDomain) {
      throw new Error("process.env.osDomain must be defined");
    }

    const osInsightsItem: OsInsightsItem = await os.getItem(
      process.env.osDomain,
      "insights",
      id,
    );
    console.log("Insights Item: ", JSON.stringify(osInsightsItem, null, 4));
    returnData.cpoc = osInsightsItem?._source?.LEAD_ANALYST
      ? buildEmailsToSend(
          osInsightsItem._source.LEAD_ANALYST,
          osInsightsItem._source.STATE_PLAN?.LEAD_ANALYST_ID,
        )
      : "'CPOC Substitute' <mako.stateuser@gmail.com>";
    returnData.srt = osInsightsItem?._source?.ACTION_OFFICERS
      ? buildEmailsToSend(osInsightsItem._source.ACTION_OFFICERS)
      : "'SRT Substitute' <mako.stateuser@gmail.com>";
    returnData.ninetyDaysDate =
      osInsightsItem?._source?.STATE_PLAN?.ALERT_90_DAYS_DATE;

    // Uncomment the following blocks if needed and ensure their typings are correct
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

export const getOsMainData = async (
  id: string,
): Promise<{ [key: string]: any }> => {
  const returnData: { [key: string]: any } = {};
  try {
    if (!process.env.osDomain) {
      throw new Error("process.env.osDomain must be defined");
    }

    const osMainItem: OsMainItem = await os.getItem(
      process.env.osDomain,
      `${process.env.indexNamespace}main`,
      id,
    );
    console.log("Main Item: ", osMainItem);

    returnData.initialSubmitterName =
      osMainItem?._source?.submitterName || "Submitter Unknown";
    returnData.initialSubmitterEmail =
      osMainItem?._source?.submitterEmail || "Submitter Email Unknown";
  } catch (error) {
    console.log("OpenSearch error is: ", error);
  }
  console.log("OS Main Lookup ReturnData: ", returnData);
  return returnData;
};
