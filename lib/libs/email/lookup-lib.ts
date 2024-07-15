import { getOsInsightData, getOsMainData } from "./os-lib";
import { getCognitoData } from "./cognito-lib";

export type LookupType = "osInsights" | "osMain" | "cognito";

export interface LookupValues {
  [key: string]: any;
}

export const getLookupValues = async (
  lookupList: LookupType[],
  lookupId: string,
): Promise<LookupValues> => {
  let returnData: LookupValues = {};

  if (
    lookupId &&
    lookupList &&
    Array.isArray(lookupList) &&
    lookupList.length > 0
  ) {
    const lookupPromises = await Promise.allSettled(
      lookupList.map(async (lookupType) => {
        switch (lookupType) {
          case "osInsights":
            return await getOsInsightData(lookupId);
          case "osMain":
            return await getOsMainData(lookupId);
          case "cognito":
            return await getCognitoData(lookupId);
          default:
            return Promise.resolve(`Don't have function for ${lookupType}`);
        }
      }),
    );

    lookupPromises.forEach((promise) => {
      if (promise.status === "fulfilled" && typeof promise.value === "object") {
        returnData = { ...returnData, ...promise.value };
      }
    });
  }

  return returnData;
};
