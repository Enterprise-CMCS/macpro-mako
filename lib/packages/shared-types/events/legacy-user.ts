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
const roleEvent = z.enum(["user-role", "legacy-user-role"]);
const skPattern = /^v[0-9]+#[a-z]+#(N\/A|[A-Z]{2})$/;

export const baseUserRoleRequestSchema = z.object({
  email: z.string().email().optional(),
  status: userStatus,
  territory: z.string(),
  role: userRoles,
  doneByEmail: z.string(),
  doneByName: z.string(),
  date: z.number(),
  eventType: roleEvent,
});
// this schema is used to ingest legacy role requests
export const onemacLegacyUserRoleRequest = baseUserRoleRequestSchema
  .extend({
    pk: z.string().email(),
    sk: z.string().regex(skPattern),
    eventType: roleEvent.default("legacy-user-role"),
  })
  .transform((data) => ({
    id: `${data.pk}_${data.territory}_${data.role}`,
    eventType: data.eventType,
    email: data.pk,
    doneByEmail: data.doneByEmail,
    doneByName: data.doneByName,
    status: data.status,
    role: data.role,
    territory: data.territory,
    lastModifiedDate: data.date,
  }));

// OneMAC Upgrade/Mako User Role Request Schema
// Rename to stateAccessRequest? this schema is used to request access to states, grant and deny access
export const userRoleRequest = baseUserRoleRequestSchema.transform((data) => ({
  id: `${data.email}_${data.territory}_${data.role}`,
  eventType: data.eventType,
  email: data.email,
  doneByEmail: data.doneByEmail,
  doneByName: data.doneByName,
  status: data.status,
  role: data.role,
  territory: data.territory,
  lastModifiedDate: data.date,
}));

// User Information Schema
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
