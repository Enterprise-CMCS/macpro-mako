import { http, HttpResponse, PathParams } from "msw";

import { REGION } from "../../consts";
import {
  CENTRA_SUBMISSION_ERROR_ITEM_ID,
  type CentraSubmitBody,
  recordCentraSubmission,
} from "../../data/centra-session";
import { SUBMISSION_ERROR_ITEM_ID } from "../../data/items";
import {
  AttachmentArchiveRequestBody,
  AttachmentUrlRequestBody,
  SubmitRequestBody,
} from "../../index.d";

const defaultApiUploadHandler = http.put(
  "https://test-bucket.s3.us-east-1.amazonaws.com/*",
  async () => new HttpResponse(null, { status: 200 }),
);

const defaultApiUploadUrlHandler = http.post(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/getUploadUrl",
  async ({ request }) => {
    const body = (await request.json()) as { fileName?: string };
    const fileName = body.fileName || "upload";
    const key = `uploads/${Date.now()}-${fileName}`;
    return HttpResponse.json(
      {
        url: `https://test-bucket.s3.us-east-1.amazonaws.com/${key}`,
        key,
        bucket: "test-bucket",
      },
      { status: 200 },
    );
  },
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

const defaultApiAttachmentArchiveHandler = http.post<PathParams, AttachmentArchiveRequestBody>(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/getAttachmentArchive",
  async ({ request }) => {
    const { id, scope, sectionId } = await request.json();
    const scopeSuffix = scope === "section" && sectionId ? `-${sectionId}` : "";

    return HttpResponse.json({
      status: "READY",
      filename: `${id}${scopeSuffix}-attachments.zip`,
      url: `https://s3.${REGION}.amazonaws.com/archive-bucket/${id}${scopeSuffix}.zip`,
    });
  },
);

export const errorApiAttachmentUrlHandler = http.post<PathParams, AttachmentUrlRequestBody>(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/getAttachmentUrl",
  async () => new HttpResponse(null, { status: 500 }),
);

export const errorApiAttachmentArchiveHandler = http.post<PathParams, AttachmentArchiveRequestBody>(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/getAttachmentArchive",
  async () => new HttpResponse(null, { status: 500 }),
);

const defaultApiSubmitHandler = http.post<PathParams, CentraSubmitBody & SubmitRequestBody>(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/submit",
  async ({ request }) => {
    const body = await request.json();
    const id = body.id?.trim().toUpperCase();

    if (body.id == SUBMISSION_ERROR_ITEM_ID || id === CENTRA_SUBMISSION_ERROR_ITEM_ID) {
      return new HttpResponse("Internal server error", { status: 500 });
    }

    if (
      body.event === "ce-record-submitted" ||
      body.event === "ce-subsequent-documents" ||
      body.authority === "CE_HARDSHIP_EXCEPTION"
    ) {
      recordCentraSubmission(body);
    }

    return HttpResponse.json({ message: "success" }, { status: 200 });
  },
);

export const submissionHandlers = [
  defaultApiUploadHandler,
  defaultApiUploadUrlHandler,
  defaultApiAttachmentUrlHandler,
  defaultApiAttachmentArchiveHandler,
  defaultApiSubmitHandler,
];
