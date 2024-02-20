import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

type GetItemBody = { id: string };

const handlers = [
  http.post<GetItemBody, GetItemBody>(
    "/item-mock-server",
    async ({ request }) => {
      const body = await request.json();
      console.log("--- mock server ---", body);
      return body.id !== "existing-id"
        ? new HttpResponse(null, { status: 404 })
        : HttpResponse.json({
            id: body.id,
            name: "Mocked Item",
          });
    }
  ),
];

export const server = setupServer(...handlers);
