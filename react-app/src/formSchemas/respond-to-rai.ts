import { attachmentArraySchema } from "shared-types";
import { events } from "shared-types/events";
import { z } from "zod";

export const formSchemaMedicaid = events["respond-to-rai"].baseSchema.extend({
  attachments: events["respond-to-rai"].medicaidSpaAttachments,
});
export const formSchemaChip = events["respond-to-rai"].baseSchema.extend({
  attachments: events["respond-to-rai"].chipSpaAttachments.extend({
    revisedAmendedStatePlanLanguage: z.object({
      label: z.string().default("Revised Amended State Plan Language"),
      files: attachmentArraySchema(),
    }),
    officialRAIResponse: z.object({
      label: z.string().default("Official RAI Response"),
      files: attachmentArraySchema(),
    }),
  }),
});
export const formSchemaWaivers = events["respond-to-rai"].baseSchema.extend({
  attachments: events["respond-to-rai"].waiverAttachments,
});
