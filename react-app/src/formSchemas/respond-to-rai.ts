import { attachmentArraySchema } from "shared-types";
import { events } from "shared-types/events";
import { z } from "zod";

export const formSchemaMedicaid = events["respond-to-rai"].baseSchema.extend({
  attachments: events["respond-to-rai"].medicaidSpaAttachments,
});
export const formSchemaChip = events["respond-to-rai"].baseSchema.extend({
  attachments: events["respond-to-rai"].chipSpaAttachments.extend({
    revisedAmendedStatePlanLanguage: z.object({
      label: z.string().default("REVISED AMENDED STATE PLAN LANGUAGE"),
      files: attachmentArraySchema(),
    }),
    officialRAIResponse: z.object({
      label: z.string().default("OFFICIAL RAI RESPONSE"),
      files: attachmentArraySchema(),
    }),
  }),
});
export const formSchemaWaivers = events["respond-to-rai"].baseSchema.extend({
  attachments: events["respond-to-rai"].waiverAttachments,
});
