import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

type GetTypesBody = { authorityId: number };

export const handlers = [
  http.post<any, GetTypesBody>("/os/getTypes", async ({ request }) => {
    const { authorityId } = await request.json();

    if (authorityId === -1) {
      throw Error("useGetTypes > mockFetch: Expected error thrown by test.");
    }

    return HttpResponse.json({
      hits: {
        hits: mockTypesDats.filter(
          (T) => T._source.authorityId === authorityId
        ),
      },
    });
  }),
];

const mockTypesDats = [
  { _source: { id: 101, authorityId: 1, name: "typeOne" } },
  { _source: { id: 102, authorityId: 1, name: "typetwo" } },
  { _source: { id: 103, authorityId: 2, name: "typethree" } },
];

export const server = setupServer(...handlers);
