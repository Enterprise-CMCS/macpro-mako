import { events } from "shared-types/events";
import { z } from "zod";

// Update package
export const deleteAdminChangeSchema = z
  .object({
    id: z.string(),
    deleted: z.boolean(),
    adminChangeType: z.literal("delete"),
    makoChangedDate: z.number(),
    changedDate: z.number(),
    statusDate: z.number(),
    timestamp: z.number(),
  })
  .and(z.record(z.string(), z.any()));

export const updateValuesAdminChangeSchema = z
  .object({
    id: z.string(),
    adminChangeType: z.literal("update-values"),
    makoChangedDate: z.number(),
    changedDate: z.number(),
    statusDate: z.number(),
    timestamp: z.number(),
  })
  .and(z.record(z.string(), z.any()));

export const updateIdAdminChangeSchema = z
  .object({
    id: z.string(),
    adminChangeType: z.literal("update-id"),
    idToBeUpdated: z.string(),
    makoChangedDate: z.number(),
    changedDate: z.number(),
    statusDate: z.number(),
    timestamp: z.number(),
  })
  .and(z.record(z.string(), z.any()));

const AdminChangeSchema = z.object({
  changeTimestamp: z.number(),
  changeReason: z.string(),
  changeMade: z.string(),
});

export const legacyEventIdUpdateSchema = z.object({
  componentId: z.string(),
  currentStatus: z.string(),
  GSI1pk: z.string(),
  adminChanges: z.array(AdminChangeSchema),
  GSI1sk: z.string(),
  sk: z.string(),
  pk: z.string(),
  submitterName: z.string(),
  eventTimestamp: z.number(),
  submitterEmail: z.string().email(),
});

export const transformDeleteSchema = (offset: number) =>
  deleteAdminChangeSchema.transform((data) => ({
    ...data,
    event: "delete",
    packageId: data.id,
    id: `${data.id}-${offset}`,
  }));

export const transformUpdateValuesSchema = (offset: number) =>
  updateValuesAdminChangeSchema.transform((data) => ({
    ...data,
    event: "update-values",
    packageId: data.id,
    id: `${data.id}-${offset}`,
  }));

export const transformedUpdateIdSchema = updateIdAdminChangeSchema.transform((data) => ({
  ...data,
  event: "update-id",
  packageId: data.id,
  id: `${data.id}`,
}));

// Split SPAs
export const submitSplitSPAAdminSchema = z.object({
  id: events["new-medicaid-submission"].baseSchema.shape.id,
  newPackageIdSuffix: z.string().regex(/^[a-zA-Z0-9]+$/, {
    message: "New package ID suffix must be alphanumeric",
  }),
  changeMade: z.string().optional(),
  changeReason: z.string().optional(),
});
export type SplitSPASubmission = z.infer<typeof submitSplitSPAAdminSchema>;

// Split SPAs made from records only existing in SEAtool are NOSOs
export const submitSplitSPANOSOAdminSchema = submitSplitSPAAdminSchema.extend({
  authority: z.literal("Medicaid SPA"),
  status: z.string(),
  submitterEmail: z.string(),
  submitterName: z.string(),
  adminChangeType: z.literal("NOSO"),
  mockEvent: z.literal("new-medicaid-submission"),
  submissionDate: z.string(),
  proposedDate: z.string(),
});

export const splitSPAAdminChangeSchema = z
  .object({
    id: z.string(),
    adminChangeType: z.literal("split-spa"),
    idToBeUpdated: z.string(),
    makoChangedDate: z.number(),
    changedDate: z.number(),
    statusDate: z.number(),
    timestamp: z.number(),
  })
  .and(z.record(z.string(), z.any()));

export const transformedSplitSPASchema = splitSPAAdminChangeSchema.transform((data) => ({
  ...data,
  event: "split-spa",
  packageId: data.id,
  id: `${data.id}`,
}));

// NOSOs
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
  submissionDate: z.string(),
  proposedDate: z.string(),
});

export const extendSubmitNOSOAdminSchema = submitNOSOAdminSchema.extend({
  packageId: z.string(),
  origin: z.string(),
  makoChangedDate: z.number(),
  changedDate: z.number(),
  statusDate: z.number(),
  timestamp: z.number(),
  submissionDate: z.number().optional(),
  proposedDate: z.number().optional(),
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
}));
