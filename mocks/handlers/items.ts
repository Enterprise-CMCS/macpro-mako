import { http, HttpResponse } from "msw";
import items, { ERROR_ITEM_ID } from "../data/items";

export type GetItemBody = { id: string };

const defaultItemHandler = http.post<GetItemBody, GetItemBody>(/\/item$/, async ({ request }) => {
  const { id } = await request.json();

  if (id == ERROR_ITEM_ID) {
    return new HttpResponse("Internal server error", { status: 500 });
  }
  const item = items[id] || null;
  return item ? HttpResponse.json(item) : new HttpResponse(null, { status: 404 });
});

const defaultItemExistsHandler = http.post<GetItemBody, GetItemBody>(
  /\/itemExists$/,
  async ({ request }) => {
    console.log("checking for item");
    const { id } = await request.json();
    if (id == ERROR_ITEM_ID) {
      return new HttpResponse("Internal server error", { status: 500 });
    }
    return HttpResponse.json({ exists: !!items[id]?._source });
  },
);

export const defaultHandlers = [defaultItemHandler, defaultItemExistsHandler];
