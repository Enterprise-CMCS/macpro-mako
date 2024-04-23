import { Action } from "shared-types";
import { AttachmentKey } from "shared-types";

export type PackageActionEndpoint = `/action/${Action}`;
export type FormSubmissionEndpoint = "/submit" | "/appk";
export type SubmissionServiceEndpoint =
  | PackageActionEndpoint
  | FormSubmissionEndpoint;
export const buildActionUrl = (action: Action): PackageActionEndpoint =>
  `/action/${action}`;

export type AttachmentRecipe<S extends Record<string, unknown>> = {
  readonly name: AttachmentKey;
  readonly required: boolean;
};
