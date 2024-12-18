import { http, HttpResponse } from "msw";
import counties from "../data/counties";

export type PopulationParams = {
  get: string | string[];
  for: string | string[];
  in: string | string[];
};

const defaultCountiesHandler = http.get<PopulationParams>(
  "https://api.census.gov/data/2019/pep/population",
  async ({ request }) => {
    const requestUrl = new URL(request.url);
    const stateSearchParam = requestUrl.searchParams.get("in") || "";
    const stateParamStringArray = stateSearchParam.split(":");
    const stateCode =
      stateParamStringArray &&
      Array.isArray(stateParamStringArray) &&
      stateParamStringArray.length > 1
        ? stateParamStringArray[1]
        : null;
    const countyListForState = stateCode ? counties[stateCode] : null;
    return countyListForState
      ? HttpResponse.json(countyListForState)
      : new HttpResponse(null, { status: 404 });
  },
);

export const countiesHandlers = [defaultCountiesHandler];
