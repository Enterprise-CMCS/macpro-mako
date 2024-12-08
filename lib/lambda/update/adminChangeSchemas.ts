import { z } from "zod";

export const deleteAdminChangeSchema = z
  .object({
    id: z.string(),
    deleted: z.boolean(),
    adminChangeType: z.literal("delete"),
  })
  .and(z.record(z.string(), z.any()));

export const updateValuesAdminChangeSchema = z
  .object({
    id: z.string(),
    adminChangeType: z.literal("update-values"),
  })
  .and(z.record(z.string(), z.any()));
