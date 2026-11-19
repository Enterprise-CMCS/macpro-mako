import { http, HttpResponse, PathParams } from "msw";
import { opensearch, SEATOOL_STATUS } from "shared-types";

import {
  type CentraDraftBody,
  deleteCentraDraft,
  getCentraItem,
  recordCentraDraft,
  resetCentraSession,
} from "../../data/centra-session";
import items, { GET_ERROR_ITEM_ID } from "../../data/items";
import type { DeleteDraftBody, GetItemBody, ItemExistsBody } from "../../index.d";

const deletedDraftIds = new Set<string>();

export const resetApiItemsState = () => {
  deletedDraftIds.clear();
  resetCentraSession();
};

const defaultApiItemHandler = http.post<PathParams, GetItemBody>(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/item",
  async ({ request }) => {
    const { id } = await request.json();

    if (id == GET_ERROR_ITEM_ID) {
      return new HttpResponse("Internal server error", { status: 500 });
    }

    const item = getCentraItem(id) || items[id] || null;

    if (!item) {
      return new HttpResponse(null, { status: 404 });
    }

    if (deletedDraftIds.has(id)) {
      return HttpResponse.json({
        ...item,
        _source: {
          ...item._source,
          deleted: true,
        },
      });
    }

    return HttpResponse.json(item);
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
    const centraItem = getCentraItem(id);
    const staticItem = items[id];
    const item = centraItem || staticItem;
    const exists = !!item?._source && !item._source.deleted && !deletedDraftIds.has(id);
    return HttpResponse.json({
      exists,
      ...(includeDrafts && exists ? { status: item?._source?.seatoolStatus } : {}),
    });
  },
);

export const errorApiItemExistsHandler = http.post(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/itemExists",
  () => new HttpResponse(null, { status: 500 }),
);

const defaultApiSaveDraftHandler = http.post(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/saveDraft",
  async ({ request }) => {
    const body = (await request.json()) as CentraDraftBody;
    if (body?.event === "ce-record-submitted" || body?.authority === "CE_HARDSHIP_EXCEPTION") {
      const saved = recordCentraDraft(body);
      if (saved.conflict) {
        return HttpResponse.json({ message: saved.message }, { status: 400 });
      }
      return HttpResponse.json({
        message: saved.message,
        id: saved.id,
        seqNo: saved.seqNo,
        primaryTerm: saved.primaryTerm,
      });
    }
    return HttpResponse.json({ message: "Draft saved" });
  },
);

const defaultApiDeleteDraftHandler = http.post<PathParams, DeleteDraftBody>(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/deleteDraft",
  async ({ request }) => {
    const { id } = await request.json();
    const centraDraft = deleteCentraDraft(id);
    if (centraDraft.ok) {
      return HttpResponse.json({ message: centraDraft.message, id });
    }
    const item = getCentraItem(id) || items[id];

    if (!id) {
      return HttpResponse.json({ message: "Event body required" }, { status: 400 });
    }

    if (
      !item?._source ||
      item._source.seatoolStatus !== SEATOOL_STATUS.DRAFT ||
      item._source.deleted ||
      deletedDraftIds.has(id)
    ) {
      return HttpResponse.json({ message: "Package is not an active draft." }, { status: 409 });
    }

    deletedDraftIds.add(id);
    return HttpResponse.json({ message: "Draft deleted", id });
  },
);

export const itemHandlers = [
  defaultApiItemHandler,
  defaultApiItemExistsHandler,
  defaultApiSaveDraftHandler,
  defaultApiDeleteDraftHandler,
];
