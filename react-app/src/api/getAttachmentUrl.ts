import { API } from "aws-amplify";

export const getAttachmentUrl = async (
  id: string,
  bucket: string,
  key: string,
  filename: string
) => {
  const response = await API.post("os", "/getAttachmentUrl", {
    body: {
      id,
      bucket,
      key,
      filename,
    },
  });
  return response.url as string;
};
