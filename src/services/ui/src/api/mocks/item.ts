import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { opensearch, SEATOOL_STATUS } from "shared-types";

type GetItemBody = { id: string };

const handlers = [
  http.post<GetItemBody, GetItemBody>(
    "/item-mock-server",
    async ({ request }) => {
      const { id} = await request.json();
      return id.includes("existing")
        ? HttpResponse.json({
          _id: id,
          _source: {
            id: id,
            seatoolStatus: id.includes("approved") ? SEATOOL_STATUS.APPROVED : SEATOOL_STATUS.PENDING
          } satisfies Pick<opensearch.main.Document, "id" | "seatoolStatus">,
        })
        : new HttpResponse(null, { status: 404 });
    }
  ),
];

export const server = setupServer(...handlers);
