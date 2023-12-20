import { Action } from "shared-types";

export type PackageActionEndpoint = `/action/${Action}`;
export type FormSubmissionEndpoint = "/submit";
export type SubmissionServiceEndpoint =
  | PackageActionEndpoint
  | FormSubmissionEndpoint;
export const buildActionUrl = (action: Action): PackageActionEndpoint =>
  `/action/${action}`;

type UploadKey<S extends Record<string, unknown>> = keyof S["attachments"];
export type AttachmentRecipe<S extends Record<string, unknown>> = {
  readonly name: UploadKey<S>;
  readonly label: string;
  readonly required: boolean;
};
