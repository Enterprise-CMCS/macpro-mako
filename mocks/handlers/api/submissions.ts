import { http, HttpResponse } from "msw";
import { SUBMISSION_ERROR_ITEM_ID } from "../../data/items";

export type SubmitRequestBody = { id: string };

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

const defaultSubmitHandler = http.post<SubmitRequestBody, SubmitRequestBody>(
  /\/submit$/,
  async ({ request }) => {
    const { id } = await request.json();

    if (id == SUBMISSION_ERROR_ITEM_ID) {
      return new HttpResponse("Internal server error", { status: 500 });
    }

    return HttpResponse.json({ message: "success" }, { status: 200 });
  },
);

export const submissionHandlers = [
  defaultUploadHandler,
  defaultUploadUrlHandler,
  defaultSubmitHandler,
];
