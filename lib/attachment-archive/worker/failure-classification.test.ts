import { describe, expect, it, vi } from "vitest";

import {
  classifyAttachmentArchiveAccessFailure,
  getAttachmentArchiveFailureState,
} from "./failure-classification";

describe("attachment archive worker failure classification", () => {
  it("classifies non-clean attachment access denials as terminal failures", async () => {
    const failure = await classifyAttachmentArchiveAccessFailure({
      attachment: {
        bucket: "mako-main-attachments-635052997545",
        key: "blocked.xlsx",
        filename: "blocked.xlsx",
        title: "Blocked attachment",
      },
      error: {
        name: "AccessDenied",
        message: "Access Denied",
        $metadata: { httpStatusCode: 403 },
      },
      getObjectTags: vi.fn().mockResolvedValue({
        virusScanStatus: "UKNOWNEXT",
      }),
    });

    expect(failure).toEqual({
      blockedAttachment: {
        bucket: "mako-main-attachments-635052997545",
        key: "blocked.xlsx",
        filename: "blocked.xlsx",
        title: "Blocked attachment",
        virusScanStatus: "UKNOWNEXT",
      },
      failureCode: "ATTACHMENT_NOT_CLEAN",
      failureMessage:
        "Unable to prepare the attachment archive because blocked.xlsx is not available for download. File scanning did not complete successfully.",
    });
  });

  it("leaves generic errors retryable", () => {
    expect(getAttachmentArchiveFailureState(new Error("boom"))).toEqual({
      errorMessage: "boom",
    });
  });

  it("preserves structured terminal failure details", () => {
    const failureError = Object.assign(
      new Error(
        "Unable to prepare the attachment archive because blocked.xlsx is not available for download. File scanning did not complete successfully.",
      ),
      {
        failureCode: "ATTACHMENT_NOT_CLEAN" as const,
        failureMessage:
          "Unable to prepare the attachment archive because blocked.xlsx is not available for download. File scanning did not complete successfully.",
        blockedAttachment: {
          bucket: "mako-main-attachments-635052997545",
          key: "blocked.xlsx",
          filename: "blocked.xlsx",
          title: "Blocked attachment",
          virusScanStatus: "UKNOWNEXT",
        },
      },
    );

    expect(getAttachmentArchiveFailureState(failureError)).toEqual({
      errorMessage:
        "Unable to prepare the attachment archive because blocked.xlsx is not available for download. File scanning did not complete successfully.",
      failureCode: "ATTACHMENT_NOT_CLEAN",
      failureMessage:
        "Unable to prepare the attachment archive because blocked.xlsx is not available for download. File scanning did not complete successfully.",
      blockedAttachment: {
        bucket: "mako-main-attachments-635052997545",
        key: "blocked.xlsx",
        filename: "blocked.xlsx",
        title: "Blocked attachment",
        virusScanStatus: "UKNOWNEXT",
      },
    });
  });
});
