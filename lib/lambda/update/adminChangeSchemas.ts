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

export const updateIdAdminChangeSchema = z
  .object({
    id: z.string(),
    adminChangeType: z.literal("update-id"),
    idToBeUpdated: z.string(),
  })
  .and(z.record(z.string(), z.any()));

export const splitSPAAdminChangeSchema = z
  .object({
    id: z.string(),
    adminChangeType: z.literal("split-spa"),
    idToBeUpdated: z.string(),
  })
  .and(z.record(z.string(), z.any()));

export const transformDeleteSchema = (offset: number) =>
  deleteAdminChangeSchema.transform((data) => ({
    ...data,
    event: "delete",
    packageId: data.id,
    id: `${data.id}-${offset}`,
    timestamp: Date.now(),
  }));

export const transformUpdateValuesSchema = (offset: number) =>
  updateValuesAdminChangeSchema.transform((data) => ({
    ...data,
    event: "update-values",
    packageId: data.id,
    id: `${data.id}-${offset}`,
    timestamp: Date.now(),
  }));

export const transformedUpdateIdSchema = updateIdAdminChangeSchema.transform((data) => ({
  ...data,
  event: "update-id",
  packageId: data.id,
  id: `${data.id}`,
  timestamp: Date.now(),
}));

export const transformedSplitSPASchema = splitSPAAdminChangeSchema.transform((data) => ({
  ...data,
  event: "split-spa",
  packageId: data.id,
  id: `${data.id}`,
}));

export const submitNOSOAdminSchema = z.object({
  id: z.string(),
  authority: z.string(),
  status: z.string(),
  submitterEmail: z.string(),
  submitterName: z.string(),
  adminChangeType: z.literal("NOSO"),
  mockEvent: z.string(),
  changeMade: z.string(),
  changeReason: z.string(),
});

export const extendSubmitNOSOAdminSchema = submitNOSOAdminSchema.extend({
  packageId: z.string(),
  origin: z.string(),
  makoChangedDate: z.number(),
  changedDate: z.number(),
  statusDate: z.number(),
  isAdminChange: z.boolean(),
  state: z.string(),
  event: z.string(),
  stateStatus: z.string(),
  cmsStatus: z.string(),
});

export const transformSubmitValuesSchema = extendSubmitNOSOAdminSchema.transform((data) => ({
  ...data,
  adminChangeType: "NOSO",
  event: "NOSO",
  id: data.id,
  packageId: data.id,
  timestamp: Date.now(),
}));
