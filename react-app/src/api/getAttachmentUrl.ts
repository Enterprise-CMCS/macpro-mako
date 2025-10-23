import { API } from "aws-amplify";

import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";
export const getAttachmentUrl = async (
  id: string,
  bucket: string,
  key: string,
  filename: string,
) => {
  const response = await API.post("os", "/getAttachmentUrl", {
    body: {
      id,
      bucket,
      key,
      filename,
    },
  });
  if (!response.url) {
    sendGAEvent("api_error", {
      message: `failure /getAttachmentUrl getting ${key}/${filename} for ${id} from bucket ${bucket}`,
    });
  }
  return response.url as string;
};
