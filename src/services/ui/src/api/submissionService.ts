import { API } from "aws-amplify";
import {
  OnemacAttachmentSchema,
  Authority,
  ReactQueryApiError,
  Action,
  attachmentTitleMap,
} from "shared-types";
import { buildActionUrl, SubmissionServiceEndpoint } from "@/lib";
import { OneMacUser } from "@/api/useGetUser";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

type SubmissionServiceParameters<T> = {
  data: T;
  endpoint: SubmissionServiceEndpoint;
  user: OneMacUser | undefined;
  authority?: Authority;
};
type SubmissionServiceResponse = {
  body: {
    message: string;
  };
};
type PreSignedURL = {
  url: string;
  key: string;
  bucket: string;
};
type UploadRecipe = PreSignedURL & {
  data: File[];
  title: string;
};
type AttachmentsSchema = Record<string, File[] | undefined>;

/** Pass in an array of UploadRecipes and get a back-end compatible object
 * to store attachment data */
const buildAttachmentObject = (
  recipes: UploadRecipe[]
): OnemacAttachmentSchema[] => {
  return recipes
    .map((r) =>
      r.data.map(
        (f) =>
          ({
            key: r.key,
            filename: f.name,
            title: r.title,
            bucket: r.bucket,
            uploadDate: Date.now(),
          } as OnemacAttachmentSchema)
      )
    )
    .flat();
};

/** Builds the payload for submission based on which variant a developer has
 * configured the {@link submit} function with */
const buildSubmissionPayload = <T extends Record<string, unknown>>(
  data: T,
  user: OneMacUser | undefined,
  endpoint: SubmissionServiceEndpoint,
  authority?: string,
  attachments?: UploadRecipe[]
) => {
  const userDetails = {
    submitterEmail: user?.user?.email ?? "N/A",
    submitterName:
      `${user?.user?.given_name} ${user?.user?.family_name}` ?? "N/A",
  };
  const seaToolFriendlyTimestamp =
    Math.floor(new Date().getTime() / 1000) * 1000; // Truncating to match seatool

  switch (endpoint) {
    case "/submit":
      return {
        ...data,
        ...userDetails,
        proposedEffectiveDate: (data.proposedEffectiveDate as Date).getTime(),
        attachments: attachments ? buildAttachmentObject(attachments) : null,
        state: (data.id as string).split("-")[0],
        authority: authority,
        origin: "micro",
      };
    case buildActionUrl(Action.WITHDRAW_RAI):
      return {
        ...data,
        attachments: attachments ? buildAttachmentObject(attachments) : null,
        withdrawDate: seaToolFriendlyTimestamp,
      };
    case buildActionUrl(Action.ISSUE_RAI):
      return {
        ...data,
        ...userDetails,
        requestedDate: seaToolFriendlyTimestamp,
        attachments: attachments ? buildAttachmentObject(attachments) : null,
      };
    case buildActionUrl(Action.RESPOND_TO_RAI):
      return {
        ...data,
        ...userDetails,
        responseDate: seaToolFriendlyTimestamp,
        attachments: attachments ? buildAttachmentObject(attachments) : null,
      };
    case buildActionUrl(Action.ENABLE_RAI_WITHDRAW):
    case buildActionUrl(Action.DISABLE_RAI_WITHDRAW):
    default:
      return {
        ...data,
        ...userDetails,
        attachments: attachments ? buildAttachmentObject(attachments) : null,
      };
  }
};

/** A useful interface for submitting form data to our submission service */
export const submit = async <T extends Record<string, unknown>>({
  data,
  endpoint,
  user,
  authority,
}: SubmissionServiceParameters<T>): Promise<SubmissionServiceResponse> => {
  if (data?.attachments) {
    const attachments = data.attachments as AttachmentsSchema;
    const validFilesetKeys = Object.keys(attachments).filter(
      (key) => attachments[key] !== undefined
    );
    // TODO: Can this be a GET instead of POST w/ empty body
    const preSignedURLs: PreSignedURL[] = await Promise.all(
      validFilesetKeys.map(() =>
        API.post("os", "/getUploadUrl", {
          body: {},
        })
      )
    );
    const uploadRecipes: UploadRecipe[] = preSignedURLs.map((obj, idx) => ({
      ...obj,
      data: attachments[validFilesetKeys[idx]] as File[],
      // Add your attachments object key and file label value to the attachmentTitleMap
      // for this transform to work. Else the title will just be the object key.
      title:
        attachmentTitleMap?.[validFilesetKeys[idx]] || validFilesetKeys[idx],
    }));
    // Upload attachments
    await Promise.all(
      uploadRecipes.map(({ url, data }) =>
        data.map((file) =>
          fetch(url, {
            body: file,
            method: "PUT",
          })
        )
      )
    );
    // Submit form data
    return await API.post("os", endpoint, {
      body: buildSubmissionPayload(
        data,
        user,
        endpoint,
        authority,
        uploadRecipes
      ),
    });
  } else {
    // Submit form data
    return await API.post("os", endpoint, {
      body: buildSubmissionPayload(data, user, endpoint, authority),
    });
  }
};

/** A useful interface for using react-query with our submission service. If you
 * are using react-hook-form's `form.handleSubmit()` pattern, bypass this and just
 * use {@link submit} (see {@link MedicaidForm} for an example). */
export const useSubmissionService = <T extends Record<string, unknown>>(
  config: SubmissionServiceParameters<T>,
  options?: UseMutationOptions<SubmissionServiceResponse, ReactQueryApiError>
) =>
  useMutation<SubmissionServiceResponse, ReactQueryApiError>(
    ["submit"],
    () => submit(config),
    options
  );
