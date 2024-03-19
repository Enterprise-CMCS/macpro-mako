import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { opensearch, SEATOOL_STATUS } from "shared-types";

type GetItemBody = { id: string };
type ItemTestFields = Pick<
  opensearch.main.Document,
  "id" | "seatoolStatus" | "actionType"
>;

const ID_SEPARATOR = "-";
type IdParamKey = keyof opensearch.main.Document;
// Because getItem(id: string) doesn't allow for easy object mocking,
// to make tests easier, you can add params to the ids your tests use
// and mock specific attributes.
// e.x. existing-approved-at=New
const getIdParam = (id: string, key: IdParamKey) =>
  id
    .split(ID_SEPARATOR)
    .find((param: string) => param.includes(key))
    ?.slice(key.length + 1); // + 1 to cover the `=` sign

const handlers = [
  http.post<GetItemBody, GetItemBody>(
    "/item-mock-server",
    async ({ request }) => {
      const { id } = await request.json();
      return id.includes("existing")
        ? HttpResponse.json({
            _id: id,
            _source: {
              id: id,
              seatoolStatus: id.includes("approved")
                ? SEATOOL_STATUS.APPROVED
                : SEATOOL_STATUS.PENDING,
              actionType: getIdParam(id, "actionType") || "New",
            } satisfies ItemTestFields,
          })
        : new HttpResponse(null, { status: 404 });
    },
  ),
];

export const server = setupServer(...handlers);
