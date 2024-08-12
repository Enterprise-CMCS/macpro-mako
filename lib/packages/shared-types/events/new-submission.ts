import { z } from "zod";
import { attachmentSchema } from "../attachments";

// These are fields we expect the frontend to provide in the api request's payload
export const feNewSubmissionSchema = z.object({
  event: z.literal("new-submission").default("new-submission"),
  eventVersion: z.literal(0).default(0),
  authority: z.string(),
  submitterName: z.string(),
  submitterEmail: z.string(),
  proposedEffectiveDate: z.number(),
  attachments: z.array(attachmentSchema).nullish(),
  additionalInformation: z.string().nullable().default(null),
  appkParent: z.boolean().optional(),
  appkParentId: z.string().nullable().default(null),
  appkTitle: z.string().nullish(),
  actionType: z.enum(["New", "Amend", "Renew", "Extend"]).optional(),
  originalWaiverNumber: z.string().nullable().default(null),
});

// These are fields we want the api backend to control to prevent manipulation.  They're added to what the frontend sends
export const beNewSubmissionSchema = z.object({
  origin: z.literal("mako").default("mako"),
  timestamp: z.number(),
});

// The overall schema is the merge of the two
export const newSubmissionSchema = feNewSubmissionSchema.merge(
  beNewSubmissionSchema,
);

// The exported inferred type is based off the merged schema
export type NewSubmission = z.infer<typeof newSubmissionSchema>;
