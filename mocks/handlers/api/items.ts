import { http, HttpResponse } from "msw";
import items, { GET_ERROR_ITEM_ID } from "../../data/items";
import type { GetItemBody } from "../../index.d";

const defaultItemHandler = http.post<GetItemBody, GetItemBody>(/\/item$/, async ({ request }) => {
  const { id } = await request.json();

  if (id == GET_ERROR_ITEM_ID) {
    return new HttpResponse("Internal server error", { status: 500 });
  }

  const item = items[id] || null;

  return item ? HttpResponse.json(item) : new HttpResponse(null, { status: 404 });
});

export const errorItemHandler = http.post(/\/item$/, () => new HttpResponse(null, { status: 500 }));

const defaultItemExistsHandler = http.post<GetItemBody, GetItemBody>(
  /\/itemExists$/,
  async ({ request }) => {
    const { id } = await request.json();
    if (id == GET_ERROR_ITEM_ID) {
      return new HttpResponse("Internal server error", { status: 500 });
    }
    return HttpResponse.json({ exists: !!items[id]?._source });
  },
);

export const errorItemExistsHandler = http.post(
  /\/itemExists$/,
  () => new HttpResponse(null, { status: 500 }),
);

export const itemHandlers = [defaultItemHandler, defaultItemExistsHandler];
