import { z } from "zod";
import { legacySharedSchema } from "./legacy-shared";

// Event schema for legacy package actions
export const legacyPackageViewSchema = legacySharedSchema.merge(
  z.object({
    submissionTimestamp: z.number().nullish(),
    componentType: z.string().nullish(),
    raiWithdrawEnabled: z.boolean().default(false),
    parentId: z.string().nullish(),
    temporaryExtensionType: z.string().nullish(),
  }),
);
export type LegacyPackageAction = z.infer<typeof legacyPackageViewSchema>;
