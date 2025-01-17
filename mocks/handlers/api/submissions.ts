import { http, HttpResponse, PathParams } from "msw";
import { SUBMISSION_ERROR_ITEM_ID } from "../../data/items";
import { SubmitRequestBody, AttachmentUrlRequestBody } from "../../index.d";
import { REGION } from "../../consts";

const defaultApiUploadHandler = http.put(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/upload",
  async () => new HttpResponse(null, { status: 200 }),
);

const defaultApiUploadUrlHandler = http.post(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/getUploadUrl",
  () =>
    HttpResponse.json(
      {
        url: "/upload",
        key: "test-key",
        bucket: "test-bucket",
      },
      { status: 200 },
    ),
);

const defaultApiAttachmentUrlHandler = http.post<PathParams, AttachmentUrlRequestBody>(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/getAttachmentUrl",
  async ({ request }) => {
    const { id, bucket, key, filename } = await request.json();
    return HttpResponse.json({
      url: `https://s3.${REGION}.amazonaws.com/${bucket}/${id}-${key}-${filename}`,
    });
  },
);

export const errorApiAttachmentUrlHandler = http.post<PathParams, AttachmentUrlRequestBody>(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/getAttachmentUrl",
  async () => new HttpResponse(null, { status: 500 }),
);

const defaultApiSubmitHandler = http.post<PathParams, SubmitRequestBody>(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/submit",
  async ({ request }) => {
    const { id } = await request.json();

    if (id == SUBMISSION_ERROR_ITEM_ID) {
      return new HttpResponse("Internal server error", { status: 500 });
    }

    return HttpResponse.json({ message: "success" }, { status: 200 });
  },
);

export const submissionHandlers = [
  defaultApiUploadHandler,
  defaultApiUploadUrlHandler,
  defaultApiAttachmentUrlHandler,
  defaultApiSubmitHandler,
];
