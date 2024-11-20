import { http, HttpResponse } from "msw";
import items from "../data/items";

export type GetItemBody = { id: string };

const defaultItemHandler = http.post<GetItemBody, GetItemBody>(/\/item$/, async ({ request }) => {
  const { id } = await request.json();
  const item = items[id] || null;
  return item ? HttpResponse.json(item) : new HttpResponse(null, { status: 404 });
});

const defaultItemExistsHandler = http.post<GetItemBody, GetItemBody>(
  /\/itemExists$/,
  async ({ request }) => {
    const { id } = await request.json();
    return HttpResponse.json({ exists: !!items[id]?._source });
  },
);

export const defaultHandlers = [defaultItemHandler, defaultItemExistsHandler];
