import { z } from "zod";

import { CE_EVENT, CE_HARDSHIP_EXCEPTION_AUTHORITY, CE_OPERATION_TYPE } from "../centra";
import { sharedSchema } from "./base-schema";
import {
  ceAdditionalInformationSchema,
  ceAttachmentsSchema,
  ceHardshipKindSchema,
  cePackageIdSchema,
  ceStateSchema,
  refineCeSubmission,
} from "./ce-shared";

export const baseSchema = z.object({
  event: z.literal(CE_EVENT.RECORD_SUBMITTED).default(CE_EVENT.RECORD_SUBMITTED),
  operationType: z
    .literal(CE_OPERATION_TYPE.RECORD_SUBMITTED)
    .default(CE_OPERATION_TYPE.RECORD_SUBMITTED),
  id: cePackageIdSchema,
  state: ceStateSchema,
  authority: z.literal(CE_HARDSHIP_EXCEPTION_AUTHORITY).default(CE_HARDSHIP_EXCEPTION_AUTHORITY),
  hardshipKind: ceHardshipKindSchema,
  proposedEffectiveDate: z.number(),
  additionalInformation: ceAdditionalInformationSchema,
  attachments: ceAttachmentsSchema,
});

export const schema = baseSchema.merge(sharedSchema).superRefine(refineCeSubmission);

export { refineCeSubmission };
