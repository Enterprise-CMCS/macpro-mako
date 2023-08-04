import { API } from "aws-amplify";

export const getAttachmentUrl = async (
  id: string,
  state: string,
  bucket: string,
  key: string
) => {
  const response = await API.post("os", "/getAttachmentUrl", {
    body: {
      id,
      state,
      bucket,
      key,
    },
  });
  return response.url;
};
