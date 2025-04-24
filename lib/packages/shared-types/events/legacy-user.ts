import { z } from "zod";

const userRoles = z.enum([
  "defaultcmsuser",
  "cmsroleapprover",
  "cmsreviewer",
  "statesystemadmin",
  "helpdesk",
  "statesubmitter",
  "systemadmin",
]);
export type UserRole = z.infer<typeof userRoles>;

const userStatus = z.enum(["active", "pending", "revoked", "denied"]);
const roleEvent = z.enum(["user-role", "legacy-user-role"]);
const userInfoEvent = z.enum(["user-info", "legacy-user-info"]);
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
// This schema is used to parse ingested legacy role requests
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
// Rename? This schema is used to parse access requests to states, grant and deny access
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
export const baseUserInformationSchema = z.object({
  email: z.string().email(),
  group: z.string().optional(),
  division: z.string().optional(),
  fullName: z.string(),
  eventType: userInfoEvent,
});

export const onemacLegacyUserInformation = baseUserInformationSchema
  .extend({
    pk: z.string().email(),
    sk: z.literal("ContactInfo"),
    eventType: userInfoEvent.default("legacy-user-info"),
  })
  .transform((data) => ({
    id: data.pk,
    eventType: data.eventType,
    email: data.pk,
    group: data.group,
    division: data.division,
    fullName: data.fullName,
  }));

export const userInformation = baseUserInformationSchema.transform((data) => ({
  id: data.email,
  eventType: data.eventType,
  email: data.email,
  group: data.group,
  division: data.division,
  fullName: data.fullName,
}));
