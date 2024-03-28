import { z } from "zod";

// A base event schema used by all legacy events.
export const legacySharedSchema = z.object({
  state: z.string().nullable().optional(),
  additionalInformation: z.string().nullable().default(null),
  submitterName: z.string(),
  submitterEmail: z.string(),
});
