import { z } from "zod";
import { attachmentSchema } from "../attachments";

// These are fields we expect the frontend to provide in the api request's payload
export const feNewSubmissionSchema = z.object({
  actionType: z.enum(["New", "Amend", "Renew", "Extend"]).optional(),
  additionalInformation: z.string().nullable().default(null),
  appkParent: z.boolean().optional(),
  appkParentId: z.string().nullable().default(null),
  appkTitle: z.string().nullish(),
  attachments: z.array(attachmentSchema).nullish(),
  authority: z.string(),
  event: z.literal("new-submission").default("new-submission"),
  eventVersion: z.literal(0).default(0),
  id: z.string(),
  originalWaiverNumber: z.string().nullable().default(null),
  proposedEffectiveDate: z.number(),
});

// These are fields we want the api backend to control to prevent manipulation.  They're added to what the frontend sends
export const beNewSubmissionSchema = z.object({
  origin: z.literal("mako").default("mako"),
  submitterName: z.string(),
  submitterEmail: z.string(),
  timestamp: z.number(),
});

// The overall schema is the merge of the two
export const newSubmissionSchema = feNewSubmissionSchema.merge(
  beNewSubmissionSchema,
);

// The exported inferred type is based off the merged schema
export type NewSubmission = z.infer<typeof newSubmissionSchema>;
