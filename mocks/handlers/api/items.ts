import { http, HttpResponse, PathParams } from "msw";
import { opensearch, SEATOOL_STATUS } from "shared-types";

import items, { GET_ERROR_ITEM_ID } from "../../data/items";
import type { DeleteDraftBody, GetItemBody, ItemExistsBody } from "../../index.d";

const defaultApiItemHandler = http.post<PathParams, GetItemBody>(
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

export const onceApiItemHandler = (item: opensearch.main.ItemResult) =>
  http.post<PathParams, GetItemBody>(
    "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/item",
    async () => {
      return item ? HttpResponse.json(item) : new HttpResponse(null, { status: 404 });
    },
  );

export const errorApiItemHandler = http.post(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/item",
  () => new HttpResponse(null, { status: 500 }),
);

const defaultApiItemExistsHandler = http.post<PathParams, ItemExistsBody>(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/itemExists",
  async ({ request }) => {
    const { id, includeDrafts } = await request.json();
    if (id == GET_ERROR_ITEM_ID) {
      return new HttpResponse("Internal server error", { status: 500 });
    }
    const exists = !!items[id]?._source;
    return HttpResponse.json({
      exists,
      ...(includeDrafts && exists ? { status: items[id]?._source?.seatoolStatus } : {}),
    });
  },
);

export const errorApiItemExistsHandler = http.post(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/itemExists",
  () => new HttpResponse(null, { status: 500 }),
);

const defaultApiSaveDraftHandler = http.post(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/saveDraft",
  () => HttpResponse.json({ message: "Draft saved" }),
);

const defaultApiDeleteDraftHandler = http.post<PathParams, DeleteDraftBody>(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/deleteDraft",
  async ({ request }) => {
    const { id } = await request.json();
    const item = items[id];

    if (!id) {
      return HttpResponse.json({ message: "Event body required" }, { status: 400 });
    }

    if (
      !item?._source ||
      item._source.seatoolStatus !== SEATOOL_STATUS.DRAFT ||
      item._source.deleted
    ) {
      return HttpResponse.json({ message: "Package is not an active draft." }, { status: 409 });
    }

    item._source.deleted = true;
    return HttpResponse.json({ message: "Draft deleted", id });
  },
);

export const itemHandlers = [
  defaultApiItemHandler,
  defaultApiItemExistsHandler,
  defaultApiSaveDraftHandler,
  defaultApiDeleteDraftHandler,
];
