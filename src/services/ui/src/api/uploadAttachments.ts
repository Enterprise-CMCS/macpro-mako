import { MakoAttachment } from "shared-types";
import { API } from "aws-amplify";

export const grabPreSignedURL = async () => {
  // TODO: Grab URL for uploading to S3 bucket
  const response = await API.post("os", "/getUploadUrl", {
    body: {},
  });
  return response as any; // this should contain a url, bucket, and key.  need to type it
};
export const uploadAttachments = (attachments: MakoAttachment[], url: URL) => {
  // TODO: S3 bucket file upload
};
