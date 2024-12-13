import { http, HttpResponse } from "msw";

const defaultApiTokenHandler = http.put("/latest/api/token", () => new HttpResponse());

export const defaultHandlers = [defaultApiTokenHandler];
