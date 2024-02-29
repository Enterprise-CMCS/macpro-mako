import { getOsInsightData } from "../libs/os-lib";
import { getCognitoData } from "../libs/cognito-lib";

export const getLookupValues = async (lookupList, lookupId) => {
    let returnData = {};
    console.log("missing a parameter?? ", lookupList, lookupId);

    if (lookupId && lookupList && Array.isArray(lookupList) && lookupList.length > 0) {
        console.log("have lookups");
    const lookupPromises = await Promise.allSettled(lookupList.map(async (lookupType) => {
      switch (lookupType) {
        case "osInsights":
          return await getOsInsightData(lookupId);
        case "cognito":
          return await getCognitoData(lookupId);
        default:
          return await Promise.resolve(`Don't have function for ${lookupType}`);
      }
    }))
    console.log("lookupPromises: ", lookupPromises);
    lookupPromises.forEach((promise) => {
      if (promise.status === "fulfilled") returnData = {...returnData, ...promise.value};
    })
  }

  return returnData;
};