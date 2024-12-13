import { http, HttpResponse } from "msw";

const defaultApiTokenHandler = http.put(/\/api\/token$/, ({ request }) => {
  console.log("defaultApiTokenHandler: ", JSON.stringify(request));
  return new HttpResponse();
});

export const defaultHandlers = [defaultApiTokenHandler];
