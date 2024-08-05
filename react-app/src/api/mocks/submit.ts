import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { opensearch, SEATOOL_STATUS } from "shared-types";

const handlers = [
  http.put("/upload", async () => {
    return new HttpResponse(null, { status: 200 });
  }),
  http.post("/getUploadUrl", () => {
    return HttpResponse.json(
      {
        url: "/upload",
        key: "test-key",
        bucket: "test-bucket",
      },
      { status: 200 }
    );
  }),
  http.post("/test", () => {
    return HttpResponse.json({ message: "pass" }, { status: 200 });
  }),
];

export const server = setupServer(...handlers);
