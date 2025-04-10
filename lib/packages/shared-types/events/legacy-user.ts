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

export const onemacLegacyUserRoleRequest = z
  .object({
    pk: z.string().email(),
    sk: z.string().regex(skPattern),
    status: userStatus,
    territory: z.string(),
    role: userRoles,
    doneByEmail: z.string(),
    doneByName: z.string(),
  })
  .transform((data) => ({
    id: `${data.pk}_${data.territory}_${data.role}`,
    eventType: "user-role",
    email: data.pk,
    doneByEmail: data.doneByEmail,
    doneByName: data.doneByName,
    status: data.status,
    role: data.role,
    territory: data.territory,
  }));

export const onemacLegacyUserInformation = z
  .object({
    pk: z.string().email(),
    sk: z.literal("ContactInfo"),
    email: z.string().email(),
    group: z.string().optional(),
    division: z.string().optional(),
    fullName: z.string(),
  })
  .transform((data) => ({
    id: data.pk,
    eventType: "user-info",
    email: data.pk,
    group: data.group,
    division: data.division,
    fullName: data.fullName,
  }));
