import { http, HttpResponse } from "msw";
import types from "../data/types";

type GetTypesBody = { authorityId: number };
type GetSubTypesBody = { authorityId: number; typeIds: number[] };

const defaultTypeHandler = http.post<any, GetTypesBody>(/\/getTypes$/, async ({ request }) => {
  const { authorityId } = await request.json();

  if (authorityId === -1) {
    throw Error("useGetTypes > mockFetch: Expected error thrown by test.");
  }

  return HttpResponse.json({
    hits: {
      hits: types.filter(
        (item) => item._source.authorityId === authorityId && !item._source.typeId,
      ),
    },
  });
});

const defaultSubTypesHandler = http.post<any, GetSubTypesBody>(
  /\/getSubTypes$/,
  async ({ request }) => {
    const { authorityId, typeIds } = await request.json();

    if (authorityId === -1) {
      throw Error("useGetSubTypes > mockFetch: Expected error thrown by test.");
    }

    const filteredData = types.filter(
      (item) =>
        item._source.authorityId === authorityId &&
        typeIds.some((typeId) => item._source.typeId === typeId),
    );

    return HttpResponse.json({
      hits: {
        hits: filteredData,
      },
    });
  },
);

export const defaultHandlers = [defaultTypeHandler, defaultSubTypesHandler];
