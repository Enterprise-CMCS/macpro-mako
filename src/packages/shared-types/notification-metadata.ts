import { z } from "zod";

// This is addiitonal notification metadata needed for email
export const notificationMetadataSchema = z.object({
      proposedEffectiveDate: z.number().nullish(),
      submissionDate: z.number().nullish(),
});

export type NotificationMetadata = z.infer<typeof notificationMetadataSchema>;
