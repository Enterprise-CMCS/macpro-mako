import { API } from "aws-amplify";
import { OnemacAttachmentSchema, ReactQueryApiError } from "shared-types";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import {FormSubmissionEndpoint, PackageActionEndpoint} from "@/lib";

type PreSignedURL = {
  url: string;
  key: string;
  bucket: string;
};
type UploadRecipe = PreSignedURL & {
  data: File[],
  title: string
}
type UploadServiceResponse = {
  body: {
    message: string;
  };
};
type AttachmentsSchema = Record<string, File[] | undefined>

/** Grabs one pre-signed URL for file upload */
const getPreSignedUrl = async (): Promise<PreSignedURL> => {
  // TODO: Can this be a GET instead of POST w/ empty body
  return await API.post("os", "/getUploadUrl", {
    body: {},
  });
};

/** Given an {@link AttachmentSchema} and array of pre signed URLs, this
 * will return an array of objects that bundle a URL, s3 key, and s3 bucket
 * with the file(s) to upload */
const buildUploadRecipes = (
  attachments: AttachmentsSchema,
  validAttachmentKeys: string[],
  preSignedUrls: PreSignedURL[]
): UploadRecipe[] => {
  return preSignedUrls.map((obj, idx) => ({
    ...obj,
    // Using validAttachmentKeys ensures we don't have any undefined value
    data: attachments[validAttachmentKeys[idx]] as File[],
    title: validAttachmentKeys[idx]
  }));
};

/** Uploads one file if given a file and its meta from {@link getPreSignedUrl} */
const uploadAttachment = async (file: File, preSignedURL: PreSignedURL) => {
  return await fetch(preSignedURL.url, {
    body: file,
    method: "PUT",
  });
};

/** Pass in an array of UploadRecipes and get a back-end compatible object
 * to store attachment data */
const buildAttachmentObject = (
  recipes: UploadRecipe[]
): OnemacAttachmentSchema[] => {
  return recipes.map((r) => r.data.map(f => ({
    key: r.key,
    filename: f.name,
    title: r.title,
    bucket: r.bucket,
    uploadDate: Date.now()
  }) satisfies OnemacAttachmentSchema)).flat();
};

const submitForm = async <T>(endpoint: FormSubmissionEndpoint | PackageActionEndpoint, data: T) =>
  await API.post("os", endpoint, {
    body: data,
  });

const submit = async <T extends Record<string, unknown>>(
  data: T,
): Promise<UploadServiceResponse> => {
  if (data?.attachments) {
    const attachments = data.attachments as AttachmentsSchema;
    const validFilesetKeys = Object.keys(attachments).filter(key => attachments[key] !== undefined);
    const preSignedURLs = await Promise.all(validFilesetKeys.map(() => getPreSignedUrl()));
    const uploadRecipes = buildUploadRecipes(
      data.attachments as AttachmentsSchema,
      validFilesetKeys,
      preSignedURLs
    );
    await Promise.all(uploadRecipes.map(r => r.data.map(f => uploadAttachment(f, r))));
    return await submitForm<T>("/submit", {
      ...data,
      attachments: buildAttachmentObject(uploadRecipes)
    });
  } else {
    return await submitForm<T>("/submit", data);
  }
};

export const useSubmissionService = <T extends Record<string, unknown>>(
  endpoint: PackageActionEndpoint | FormSubmissionEndpoint,
  options?: UseMutationOptions<UploadServiceResponse, ReactQueryApiError, T>
) => {
  return useMutation<UploadServiceResponse, ReactQueryApiError, T>(
    ["submit"],
    (data: T) => submit(data),
    options
  );
};
