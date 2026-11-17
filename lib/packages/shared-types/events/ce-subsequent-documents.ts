import { z } from "zod";

import { CE_EVENT, CE_HARDSHIP_EXCEPTION_AUTHORITY, CE_OPERATION_TYPE } from "../centra";
import { sharedSchema } from "./base-schema";
import {
  ceAttachmentsSchema,
  ceHardshipKindSchema,
  cePackageIdSchema,
  ceStateSchema,
  ceSubsequentInformationSchema,
  refineCeSubmission,
} from "./ce-shared";

export const baseSchema = z.object({
  event: z.literal(CE_EVENT.SUBSEQUENT_DOCUMENTS).default(CE_EVENT.SUBSEQUENT_DOCUMENTS),
  operationType: z
    .literal(CE_OPERATION_TYPE.SUBSEQUENT_DOCUMENTS)
    .default(CE_OPERATION_TYPE.SUBSEQUENT_DOCUMENTS),
  id: cePackageIdSchema,
  state: ceStateSchema,
  authority: z.literal(CE_HARDSHIP_EXCEPTION_AUTHORITY).default(CE_HARDSHIP_EXCEPTION_AUTHORITY),
  hardshipKind: ceHardshipKindSchema,
  additionalInformation: ceSubsequentInformationSchema,
  attachments: ceAttachmentsSchema,
});

export const schema = baseSchema.merge(sharedSchema).superRefine(refineCeSubmission);

export { refineCeSubmission };
