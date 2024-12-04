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
    const url = new URL(request.url);
    const stateParam = url.searchParams.get("in");
    const arr = stateParam?.split(":");
    const list = arr?.length && arr.length > 1 ? counties[arr[1]] : null;
    return list ? HttpResponse.json(list) : new HttpResponse(null, { status: 404 });
  },
);

export const defaultHandlers = [defaultCountiesHandler];
