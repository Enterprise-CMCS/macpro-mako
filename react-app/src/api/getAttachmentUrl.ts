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
    sendGAEvent("error", {
      message: "error retrieving attachments",
    });
  }
  return response.url as string;
};
