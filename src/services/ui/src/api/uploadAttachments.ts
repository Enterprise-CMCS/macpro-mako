import { API } from "aws-amplify";
import { Attachment } from "@/api/submit";

type PreSignedURL = {
  url: URL;
  key: string;
  bucket: string;
};

export type UploadRecipe = {
  s3Info: PreSignedURL;
  attachment: Attachment;
};

export const grabPreSignedURL = async () => {
  // TODO: Grab URL for uploading to S3 bucket
  const response = await API.post("os", "/getUploadUrl", {
    body: {},
  });
  return response as any; // this should contain a url, bucket, and key.  need to type it
};
export const grabAllPreSignedURLs = async (attachments: Attachment[]) => {
  const promises = Promise.all<PreSignedURL>(
    attachments.map(() => grabPreSignedURL())
  );
  return await Promise.resolve(promises);
};
export const uploadAttachments = async (
  attachment: Attachment,
  s3Meta: PreSignedURL
) => {
  const response = fetch(s3Meta.url, {
    method: "PUT",
    body: attachment.source,
  });
  return await response;
};
export const uploadAllAttachments = async (
  attachmentsToUpload: UploadRecipe[]
) => {
  const uploadPromises = Promise.all(
    attachmentsToUpload.map(({ attachment, s3Info }) =>
      uploadAttachments(attachment, s3Info)
    )
  );
  return await Promise.resolve(uploadPromises);
};
