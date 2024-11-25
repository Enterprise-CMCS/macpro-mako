import { http, HttpResponse } from "msw";

const defaultUploadHandler = http.put(
  /\/upload/,
  async () => new HttpResponse(null, { status: 200 }),
);

const defaultUploadUrlHandler = http.post(/\/getUploadUrl/, () =>
  HttpResponse.json(
    {
      url: "/upload",
      key: "test-key",
      bucket: "test-bucket",
    },
    { status: 200 },
  ),
);

const defaultTestHandler = http.post(/\/test/, () =>
  HttpResponse.json({ message: "pass" }, { status: 200 }),
);

export const defaultHandlers = [defaultUploadHandler, defaultUploadUrlHandler, defaultTestHandler];
