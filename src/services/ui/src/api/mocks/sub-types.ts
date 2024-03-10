import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

type GetSubTypesBody = { authorityId: number; typeIds: number[] };

export const handlers = [
  http.post<any, GetSubTypesBody>("/os/getSubTypes", async ({ request }) => {
    const { authorityId, typeIds } = await request.json();

    if (authorityId === -1) {
      throw Error("useGetSubTypes > mockFetch: Expected error thrown by test.");
    }

    // Use the some method to check if at least one typeId matches.
    const filteredData = mockTypesDats.filter(
      (T) =>
        T._source.authorityId === authorityId &&
        typeIds.some((typeId) => T._source.typeId === typeId),
    );

    return HttpResponse.json({
      hits: {
        hits: filteredData,
      },
    });
  }),
];

const mockTypesDats = [
  { _source: { id: 101, authorityId: 1, name: "subtypeOne", typeId: 1 } },
  { _source: { id: 102, authorityId: 1, name: "subtypetwo", typeId: 2 } },
  { _source: { id: 103, authorityId: 2, name: "subtypethree", typeId: 1 } },
  { _source: { id: 104, authorityId: 2, name: "subtypethree", typeId: 4 } },
  { _source: { id: 105, authorityId: 2, name: "subtypethree", typeId: 3 } },
];

export const server = setupServer(...handlers);
