import { MakoAttachment } from "shared-types";
import { API } from "aws-amplify";
import { SpaSubmissionAttachment } from "@/api/submit";

type PreSignedURL = {
  url: URL;
  key: string;
  bucket: string;
};

export const grabPreSignedURL = async () => {
  // TODO: Grab URL for uploading to S3 bucket
  const response = await API.post("os", "/getUploadUrl", {
    body: {},
  });
  return response as any; // this should contain a url, bucket, and key.  need to type it
};
export const grabAllPreSignedURLs = async (
  attachments: SpaSubmissionAttachment[]
) => {
  const promises = Promise.all<PreSignedURL>(
    attachments.map((a) => {
      console.log(a);
      return grabPreSignedURL();
    })
  );
  return await Promise.resolve(promises);
};
export const uploadAttachments = async (
  attachment: SpaSubmissionAttachment,
  s3Meta: PreSignedURL
) => {
  const response = fetch(s3Meta.url, {
    method: "PUT",
    body: attachment.source,
  });
  return await response;
};
export const uploadAllAttachments = async (
  attachments: SpaSubmissionAttachment[],
  s3Metas: PreSignedURL[]
) => {
  const uploadPromises = Promise.all(
    attachments.map((attachment, idx) => {
      const promise = uploadAttachments(attachment, s3Metas[idx]);
      console.log(promise);
      return promise;
    })
  );
  return await Promise.resolve(uploadPromises);
};
