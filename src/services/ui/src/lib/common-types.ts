import { Action } from "shared-types";

export type PackageActionEndpoint = `/action/${Action}`;
export type FormSubmissionEndpoint = "/submit";
export type SubmissionServiceEndpoint =
  | PackageActionEndpoint
  | FormSubmissionEndpoint;
export const buildActionUrl = (action: Action): PackageActionEndpoint =>
  `/action/${action}`;
