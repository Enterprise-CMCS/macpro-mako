import { Action } from "shared-types";
import { ZodEffects, ZodObject } from "zod";

export type PackageActionEndpoint = `/action/${Action}`;
export type FormSubmissionEndpoint = "/submit";
export type SubmissionServiceEndpoint =
  | PackageActionEndpoint
  | FormSubmissionEndpoint;
export const buildActionUrl = (action: Action): PackageActionEndpoint =>
  `/action/${action}`;

export type AttachmentRecipe<S extends Record<string, unknown>> = {
  readonly name: keyof S["attachments"] | string;
  readonly label: string;
  readonly required: boolean;
};

export type FormSetup = {
  schema: ZodObject<any> | ZodEffects<any>;
  attachments: AttachmentRecipe<any>[];
};
