import { http, HttpResponse } from "msw";
import { types, subtypes } from "../../data/types";

type GetTypesBody = { authorityId: number };
type GetSubTypesBody = { authorityId: number; typeIds: number[] };

const defaultTypeHandler = http.post<any, GetTypesBody>(/\/getTypes$/, async ({ request }) => {
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
});

export const errorTypeHandler = http.post<any, GetTypesBody>(
  /\/getTypes$/,
  async () => new HttpResponse("Internal server error", { status: 500 }),
);

const defaultSubTypesHandler = http.post<any, GetSubTypesBody>(
  /\/getSubTypes$/,
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

export const errorSubTypesHandler = http.post<any, GetSubTypesBody>(
  /\/getSubTypes$/,
  () => new HttpResponse("Internal server error", { status: 500 }),
);

export const typeHandlers = [defaultTypeHandler, defaultSubTypesHandler];
