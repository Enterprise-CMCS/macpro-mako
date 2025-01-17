import { http, HttpResponse, PathParams } from "msw";
import { SUBMISSION_ERROR_ITEM_ID } from "../../data/items";
import { SubmitRequestBody, AttachmentUrlRequestBody } from "../../index.d";
import { REGION } from "../../consts";

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

const defaultAttachmentUrlHandler = http.post<PathParams, AttachmentUrlRequestBody>(
  /\/getAttachmentUrl$/,
  async ({ request }) => {
    const { id, bucket, key, filename } = await request.json();
    return HttpResponse.json({
      url: `https://s3.${REGION}.amazonaws.com/${bucket}/${id}-${key}-${filename}`,
    });
  },
);

export const errorAttachmentUrlHandler = http.post<PathParams, AttachmentUrlRequestBody>(
  /\/getAttachmentUrl$/,
  async () => new HttpResponse(null, { status: 500 }),
);

const defaultSubmitHandler = http.post<PathParams, SubmitRequestBody>(
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
  defaultAttachmentUrlHandler,
  defaultSubmitHandler,
];
