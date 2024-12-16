import { http, HttpResponse } from "msw";
import { types, subtypes, ERROR_AUTHORITY_ID } from "../data/types";

type GetTypesBody = { authorityId: number };
type GetSubTypesBody = { authorityId: number; typeIds: number[] };

const defaultTypeHandler = http.post<any, GetTypesBody>(/\/getTypes$/, async ({ request }) => {
  const { authorityId } = await request.json();

  if (authorityId === ERROR_AUTHORITY_ID) {
    throw Error("useGetTypes > mockFetch: Expected error thrown by test.");
  }

  const hits = types.filter(type => type?._source?.authorityId == authorityId && !type?._source?.name.match(/Do Not Use/)) || []

  return HttpResponse.json({
    hits: {
      hits,
    },
  });
});

const defaultSubTypesHandler = http.post<any, GetSubTypesBody>(
  /\/getSubTypes$/,
  async ({ request }) => {
    const { authorityId, typeIds } = await request.json();

    if (authorityId === ERROR_AUTHORITY_ID) {
      throw Error("useGetSubTypes > mockFetch: Expected error thrown by test.");
    }

    const hits = subtypes.filter(type =>
      type?._source?.authorityId == authorityId 
      && typeIds.includes(type?._source?.typeId)
      && !type?._source?.name.match(/Do Not Use/)
    ) || []

    return HttpResponse.json({
      hits: {
        hits,
      },
    });
  },
);

export const defaultHandlers = [defaultTypeHandler, defaultSubTypesHandler];
