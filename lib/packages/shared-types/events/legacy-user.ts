import { z } from "zod";

const userRoles = z.enum([
  "defaultcmsuser",
  "cmsroleapprover",
  "cmsreviewer",
  "statesystemadmin",
  "helpdesk",
  "statesubmitter",
]);
const userStatus = z.enum(["active", "pending", "revoked", "denied"]);
const skPattern = /^v[0-9]+#[a-z]+#(N\/A|[A-Z]{2})$/;

export const onemacLegacyUserRoleRequest = z.object({
  sk: z.string().regex(skPattern),
  status: userStatus,
  territory: z.string(),
  role: userRoles,
  doneByEmail: z.string(),
  doneByName: z.string(),
});

export const onemacLegacyUserInformation = z.object({
  sk: z.literal("ContactInfo"),
  email: z.string().email(),
  group: z.string().optional(),
  division: z.string().optional(),
});
