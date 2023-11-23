import { API } from "aws-amplify";
import { OnemacAttachmentSchema, Authority } from "shared-types";
import {SubmissionServiceEndpoint} from "@/lib";
import {OneMacUser} from "@/api/useGetUser";

export enum SubmissionVariant {
  INITIAL = "initial",
  ACTION = "action"
}
type PreSignedURL = {
  url: string;
  key: string;
  bucket: string;
};
type UploadRecipe = PreSignedURL & {
  data: File[],
  title: string
}
type UploadServiceParameters<T> = {
  data: T,
  endpoint: SubmissionServiceEndpoint
  variant: SubmissionVariant,
  user: OneMacUser | undefined,
  authority?: Authority
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

const buildSubmissionPayload = <T extends Record<string, unknown>>(
  data: T,
  variant: SubmissionVariant,
  user: OneMacUser | undefined,
  authority?: string,
  attachments?: UploadRecipe[],
) => {
  switch (variant) {
    case SubmissionVariant.ACTION:
      return {
        ...data,
        attachments: attachments ? buildAttachmentObject(attachments) : null
      };
    case SubmissionVariant.INITIAL:
      return {
        ...data,
        attachments: attachments ? buildAttachmentObject(attachments) : null,
        // TODO: How much of this is common use in the foreseeable future
        origin: "micro",
        authority: authority,
        state: (data.id as string).split("-")[0],
        submitterEmail: user?.user?.email ?? "N/A",
        submitterName:
          `${user?.user?.given_name} ${user?.user?.family_name}` ?? "N/A"
      };
  }
};

const submitForm = async <T>(endpoint: SubmissionServiceEndpoint, data: T) =>
  await API.post("os", endpoint, {
    body: data,
  });

export const submit = async <T extends Record<string, unknown>>({
  data,
  endpoint,
  variant,
  user,
  authority
}: UploadServiceParameters<T>): Promise<UploadServiceResponse> => {
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
    return await submitForm<T>(endpoint, buildSubmissionPayload(data, variant, user, authority, uploadRecipes));
  } else {
    return await submitForm<T>(endpoint, buildSubmissionPayload(data, variant, user, authority));
  }
};
