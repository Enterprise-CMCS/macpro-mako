import { z } from "zod";
import { legacySharedSchema } from "./legacy-shared";
import { legacyAttachmentSchema } from "../attachments";

// Event schema for legacy records
export const legacyEventSchema = legacySharedSchema.merge(
  z.object({
    eventTimestamp: z.number().nullish(),
    lastEventTimestamp: z.number().nullish(),
    pk: z.string(),
    currentStatus: z.string().nullish(),
    subStatus: z.string().nullish(),
    proposedEffectiveDate: z.string().nullish(),
    GSI1pk: z.string(),
    componentId: z.string(),
    waiverAuthority: z.string().nullish(),
    title: z.string().nullish(),
    parentId: z.string().nullish(),
    temporaryExtensionType: z.string().nullish(),
    attachments: z.array(legacyAttachmentSchema).nullish(),
  }),
);
export type LegacyEvent = z.infer<typeof legacyEventSchema>;
