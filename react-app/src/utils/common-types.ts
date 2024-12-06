import { Action } from "shared-types/actions";
import { AttachmentKey } from "shared-types/attachments";

export type PackageActionEndpoint = `/action/${Action}`;
export type FormSubmissionEndpoint = "/submit" | "/appk";
export type SubmissionServiceEndpoint = PackageActionEndpoint | FormSubmissionEndpoint;
export const buildActionUrl = (action: Action): PackageActionEndpoint => `/action/${action}`;

export type AttachmentRecipe = {
  readonly name: AttachmentKey;
  readonly required: boolean;
};
