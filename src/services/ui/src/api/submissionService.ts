import { API } from "aws-amplify";
import {
  Attachment,
  Authority,
  ReactQueryApiError,
  Action,
  attachmentTitleMap,
} from "shared-types";
import { buildActionUrl, SubmissionServiceEndpoint } from "@/lib";
import { OneMacUser } from "@/api/useGetUser";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { seaToolFriendlyTimestamp } from "shared-utils";

export type SubmissionServiceParameters<T> = {
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
  data: File;
  title: string;
  name: string;
};

/** Pass in an array of UploadRecipes and get a back-end compatible object
 * to store attachment data */
export const buildAttachmentObject = (recipes?: UploadRecipe[]) => {
  if (!recipes) return null;
  return recipes
    .map(
      (r) =>
        ({
          key: r.key,
          filename: r.name,
          title: r.title,
          bucket: r.bucket,
          uploadDate: Date.now(),
        }) as Attachment
    )
    .flat();
};

/** Builds the payload for submission based on which variant a developer has
 * configured the {@link submit} function with */
export const buildSubmissionPayload = <T extends Record<string, unknown>>(
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

  switch (endpoint) {
    case "/submit":
      return {
        authority: authority,
        origin: "micro",
        ...data,
        ...userDetails,
        proposedEffectiveDate: seaToolFriendlyTimestamp(
          data.proposedEffectiveDate as Date
        ),
        attachments: attachments ? buildAttachmentObject(attachments) : null,
        state: (data.id as string).split("-")[0],
      };
    case "/appk":
      return {
        ...data,
        ...userDetails,
        authority: Authority["1915c"],
        origin: "micro",
        proposedEffectiveDate: seaToolFriendlyTimestamp(
          data.proposedEffectiveDate as Date
        ),
        attachments: buildAttachmentObject(attachments),
      };
    case buildActionUrl(Action.REMOVE_APPK_CHILD):
      return {
        ...data,
        ...userDetails,
        authority: Authority["1915c"],
        origin: "micro",
      };

    case buildActionUrl(Action.WITHDRAW_RAI):
      return {
        authority: authority,
        origin: "micro",
        ...data,
        ...userDetails,
        attachments: buildAttachmentObject(attachments),
      };
    case buildActionUrl(Action.ISSUE_RAI):
      return {
        authority: authority,
        origin: "micro",
        ...data,
        ...userDetails,
        attachments: buildAttachmentObject(attachments),
      };
    case buildActionUrl(Action.RESPOND_TO_RAI):
      return {
        authority: authority,
        origin: "micro",
        ...data,
        ...userDetails,
        attachments: buildAttachmentObject(attachments),
      };
    case buildActionUrl(Action.WITHDRAW_PACKAGE):
      return {
        authority: authority,
        origin: "micro",
        ...data,
        ...userDetails,
        attachments: buildAttachmentObject(attachments),
      };
    case buildActionUrl(Action.ENABLE_RAI_WITHDRAW):
    case buildActionUrl(Action.DISABLE_RAI_WITHDRAW):
    default:
      return {
        authority: authority,
        origin: "micro",
        ...data,
        ...userDetails,
        attachments: buildAttachmentObject(attachments),
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
    // Drop nulls and non arrays
    const attachments = Object.entries(data.attachments)
      .filter(([, val]) => val !== undefined && (val as File[]).length)
      .map(([key, value]) => {
        return (value as File[]).map((file) => ({
          attachmentKey: key,
          file: file,
        }));
      })
      .flat();
    // Generate a presigned url for each attachment
    const preSignedURLs: PreSignedURL[] = await Promise.all(
      attachments.map(() =>
        API.post("os", "/getUploadUrl", {
          body: {},
        })
      )
    );
    // For each attachment, add name, title, and a presigned url... and push to uploadRecipes
    const uploadRecipes: UploadRecipe[] = preSignedURLs.map((obj, idx) => ({
      ...obj, // Spreading the presigned url
      data: attachments[idx].file, // The attachment file object
      // Add your attachments object key and file label value to the attachmentTitleMap
      // for this transform to work. Else the title will just be the object key.
      title:
        attachmentTitleMap?.[attachments[idx].attachmentKey] ||
        attachments[idx].attachmentKey,
      name: attachments[idx].file.name,
    }));
    // Upload attachments
    await Promise.all(
      uploadRecipes.map(async ({ url, data }) => {
        await fetch(url, {
          body: data,
          method: "PUT",
        });
      })
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
