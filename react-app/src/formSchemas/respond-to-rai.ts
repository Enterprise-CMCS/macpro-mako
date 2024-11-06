import { events } from "shared-types/events";

export const formSchemaMedicaid = events["respond-to-rai"].baseSchema.extend({
  attachments: events["respond-to-rai"].medicaidSpaAttachments,
});
export const formSchemaChip = events["respond-to-rai"].baseSchema.extend({
  attachments: events["respond-to-rai"].chipSpaAttachments,
});
export const formSchemaWaivers = events["respond-to-rai"].baseSchema.extend({
  attachments: events["respond-to-rai"].waiverAttachments,
});
