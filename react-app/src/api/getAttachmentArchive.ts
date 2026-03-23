import { API } from "aws-amplify";

import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";

export type AttachmentArchiveScope = "all" | "section";

export type AttachmentArchiveResponse =
  | {
      status: "READY";
      filename: string;
      url: string;
      warningMessage?: string;
    }
  | {
      status: "PENDING";
      pollAfterSeconds?: number;
    }
  | {
      status: "FAILED";
      message?: string;
    };

export const getAttachmentArchive = async (
  id: string,
  scope: AttachmentArchiveScope,
  sectionId?: string,
): Promise<AttachmentArchiveResponse> => {
  const response = (await API.post("os", "/getAttachmentArchive", {
    body: {
      id,
      scope,
      ...(sectionId ? { sectionId } : {}),
    },
  })) as Partial<AttachmentArchiveResponse>;

  if (!response.status) {
    sendGAEvent("api_error", {
      message: `failure /getAttachmentArchive for ${id} (${scope}${sectionId ? `:${sectionId}` : ""})`,
    });
    throw new Error("Attachment archive response was missing a status");
  }

  return response as AttachmentArchiveResponse;
};
