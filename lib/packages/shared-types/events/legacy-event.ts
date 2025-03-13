import { z } from "zod";

import { legacyAttachmentSchema } from "../attachments";

import { legacySharedSchema } from "./legacy-shared";

// Event schema for legacy records
export const legacyEventSchema = legacySharedSchema.merge(
  z.object({
    eventTimestamp: z.number().nullish(),
    GSI1pk: z.string(),
    componentId: z.string(),
    attachments: z.array(legacyAttachmentSchema).nullish(),
  }),
);
export type LegacyEvent = z.infer<typeof legacyEventSchema>;
