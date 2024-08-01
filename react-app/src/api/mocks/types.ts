import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

type GetTypesBody = { authorityId: number };
type GetSubTypesBody = { authorityId: number; typeIds: number[] };

export const handlers = [
  http.post<any, GetTypesBody>("/os/getTypes", async ({ request }) => {
    const { authorityId } = await request.json();

    if (authorityId === -1) {
      throw Error("useGetTypes > mockFetch: Expected error thrown by test.");
    }

    return HttpResponse.json({
      hits: {
        hits: mockData.filter(
          (item) =>
            item._source.authorityId === authorityId && !item._source.typeId,
        ),
      },
    });
  }),

  http.post<any, GetSubTypesBody>("/os/getSubTypes", async ({ request }) => {
    const { authorityId, typeIds } = await request.json();

    if (authorityId === -1) {
      throw Error("useGetSubTypes > mockFetch: Expected error thrown by test.");
    }

    const filteredData = mockData.filter(
      (item) =>
        item._source.authorityId === authorityId &&
        typeIds.some((typeId) => item._source.typeId === typeId),
    );

    return HttpResponse.json({
      hits: {
        hits: filteredData,
      },
    });
  }),
];

const mockData = [
  { _source: { id: 101, authorityId: 1, name: "typeOne" } },
  { _source: { id: 102, authorityId: 1, name: "typetwo" } },
  { _source: { id: 103, authorityId: 2, name: "typethree" } },
  { _source: { id: 101, authorityId: 1, name: "subtypeOne", typeId: 1 } },
  { _source: { id: 102, authorityId: 1, name: "subtypetwo", typeId: 2 } },
  { _source: { id: 103, authorityId: 2, name: "subtypethree", typeId: 1 } },
  { _source: { id: 104, authorityId: 2, name: "subtypethree", typeId: 4 } },
  { _source: { id: 105, authorityId: 2, name: "subtypethree", typeId: 3 } },
];

export const server = setupServer(...handlers);
