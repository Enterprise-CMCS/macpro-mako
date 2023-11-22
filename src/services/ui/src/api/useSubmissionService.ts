import { API } from "aws-amplify";
import { OnemacAttachmentSchema, ReactQueryApiError } from "shared-types";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ZodObject } from "zod";

type PreSignedURL = {
  url: string;
  key: string;
  bucket: string;
};
type UploadServiceResponse = {
  body: {
    message: string;
  };
};
const submitEndpoint = "/submit";

/** Grabs one pre-signed URL for file upload */
const getPresignedUrl = async (): Promise<PreSignedURL> => {
  // TODO: Can this be a GET instead of POST w/ empty body
  return await API.post("os", "/getUploadUrl", {
    body: {},
  });
};

/** Pass in an array of PreSignedURL data from {@link getPresignedUrl} and get
 * a data-storage friendly version of the attachment meta */
const packageAttachmentInfo = (
  meta: PreSignedURL[]
): OnemacAttachmentSchema[] => {
  return meta.map((m) => ({
    key: m.key,
    filename: "", // TODO: get filename in here
    title: "", // TODO: get title in here
    bucket: m.bucket,
  }) satisfies OnemacAttachmentSchema);
};

/** Uploads one file if given a file and its meta from {@link getPresignedUrl} */
const uploadAttachment = async (file: File, meta: PreSignedURL) => {
  return await fetch(meta.url, {
    body: file,
    method: "PUT",
  });
};

const submit = async <T extends Record<string, unknown>>(
  data: T,
): Promise<UploadServiceResponse> => {
  if (data?.attachments) {
    // TODO: Grab URLs - loop thru attachments and get n-many urls synchronously
    // TODO: Package them up - Object.keys(data.attachments) gonna need that
    // TODO: Upload attachments
  }
  // TODO: Submit form data
  return await API.put("os", submitEndpoint, { body: { data } });
};

export const useSubmissionService = <T extends Record<string, unknown>>(
  options?: UseMutationOptions<UploadServiceResponse, ReactQueryApiError, T>
) => {
  return useMutation<UploadServiceResponse, ReactQueryApiError, T>(
    ["submit"],
    (data: T) => submit(data),
    options
  );
};
