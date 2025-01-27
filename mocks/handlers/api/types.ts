import { http, HttpResponse } from "msw";
import { types, subtypes } from "../../data/types";

type GetTypesBody = { authorityId: number };
type GetSubTypesBody = { authorityId: number; typeIds: number[] };

const defaultApiTypeHandler = http.post<any, GetTypesBody>(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/getTypes",
  async ({ request }) => {
    const { authorityId } = await request.json();

    const hits =
      types.filter(
        (type) =>
          type?._source?.authorityId == authorityId && !type?._source?.name.match(/Do Not Use/),
      ) || [];

    return HttpResponse.json({
      hits: {
        hits,
      },
    });
  },
);

export const errorApiTypeHandler = http.post<any, GetTypesBody>(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/getTypes",
  async () => new HttpResponse("Internal server error", { status: 500 }),
);

const defaultApiSubTypesHandler = http.post<any, GetSubTypesBody>(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/getSubTypes",
  async ({ request }) => {
    const { authorityId, typeIds } = await request.json();

    const hits =
      subtypes.filter(
        (type) =>
          type?._source?.authorityId == authorityId &&
          typeIds.includes(type?._source?.typeId) &&
          !type?._source?.name.match(/Do Not Use/),
      ) || [];

    return HttpResponse.json({
      hits: {
        hits,
      },
    });
  },
);

export const errorApiSubTypesHandler = http.post<any, GetSubTypesBody>(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/getSubTypes",
  () => new HttpResponse("Internal server error", { status: 500 }),
);

export const typeHandlers = [defaultApiTypeHandler, defaultApiSubTypesHandler];
