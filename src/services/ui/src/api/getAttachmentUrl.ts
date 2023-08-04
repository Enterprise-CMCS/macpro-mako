import { API } from "aws-amplify";

export const getAttachmentUrl = async (
  id: string,
  state: string,
  bucket: string,
  key: string
): Promise<{ url: string }> => {
  const url = await API.post("os", "/getAttachmentUrl", {
    body: {
      id,
      state,
      bucket,
      key,
    },
  });
  console.log(url);
  return url;
};
