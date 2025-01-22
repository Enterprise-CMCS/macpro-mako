import { http, HttpResponse } from "msw";
import items, { GET_ERROR_ITEM_ID } from "../../data/items";
import type { GetItemBody } from "../../index.d";

const defaultApiItemHandler = http.post<GetItemBody, GetItemBody>(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/item",
  async ({ request }) => {
    const { id } = await request.json();

    if (id == GET_ERROR_ITEM_ID) {
      return new HttpResponse("Internal server error", { status: 500 });
    }

    const item = items[id] || null;

    return item ? HttpResponse.json(item) : new HttpResponse(null, { status: 404 });
  },
);

export const errorApiItemHandler = http.post(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/item",
  () => new HttpResponse(null, { status: 500 }),
);

const defaultApiItemExistsHandler = http.post<GetItemBody, GetItemBody>(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/itemExists",
  async ({ request }) => {
    const { id } = await request.json();
    if (id == GET_ERROR_ITEM_ID) {
      return new HttpResponse("Internal server error", { status: 500 });
    }
    return HttpResponse.json({ exists: !!items[id]?._source });
  },
);

export const errorApiItemExistsHandler = http.post(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/itemExists",
  () => new HttpResponse(null, { status: 500 }),
);

export const itemHandlers = [defaultApiItemHandler, defaultApiItemExistsHandler];
