import { UserStatusType } from "@aws-sdk/client-cognito-identity-provider";

export { CognitoUser } from "amazon-cognito-identity-js";
export type { UserData } from "amazon-cognito-identity-js";
export type {
  APIGatewayEvent,
  APIGatewayEventIdentity,
  APIGatewayEventRequestContext,
} from "aws-lambda";

export enum UserRoles {
  CMS_READ_ONLY = "onemac-micro-readonly", // this isn't a thing
  CMS_REVIEWER = "ONEMAC_USER_D",
  HELPDESK = "onemac-helpdesk",
  STATE_SUBMITTER = "onemac-state-user",
  CMS_SUPER_USER = "ONEMAC_USER_D_SUPER",
}

export type UserRolesString = `${UserRoles}${"," | ""}` | "";

export type CognitoUserAttributes = {
  sub: string;
  "custom:cms-roles": UserRolesString; // comma-separated list of UserRoles ex. "onemac-micro-reviewer,onemac-micro-helpdesk" or "onemac-micro-statesubmitter"
  "custom:ismemberof"?: UserRolesString;
  email_verified: boolean;
  "custom:state"?: string; // ex. "VA" or "VA,MD,CA" or undefined
  given_name: string;
  family_name: string;
  email: string;
  username: string;
};

export const CMS_ROLES = [
  UserRoles.CMS_READ_ONLY,
  UserRoles.CMS_REVIEWER,
  UserRoles.HELPDESK,
  UserRoles.CMS_SUPER_USER,
];

export const CMS_WRITE_ROLES = [UserRoles.CMS_REVIEWER, UserRoles.CMS_SUPER_USER];

export const CMS_READ_ONLY_ROLES = [UserRoles.CMS_READ_ONLY, UserRoles.HELPDESK];

export const STATE_ROLES = [UserRoles.STATE_SUBMITTER];

export const RoleDescriptionStrings: { [key: string]: string } = {
  [UserRoles.CMS_READ_ONLY]: "Read Only",
  [UserRoles.CMS_REVIEWER]: "Reviewer",
  [UserRoles.HELPDESK]: "Helpdesk",
  [UserRoles.STATE_SUBMITTER]: "State Submitter",
  [UserRoles.CMS_SUPER_USER]: "Super User",
};

export type UserAttributes = {
  firstName: string | undefined;
  lastName: string | undefined;
  email: string | undefined;
  states: string | undefined;
  roles: string | undefined;
  enabled: boolean | undefined;
  status: UserStatusType | undefined;
  username: string | undefined;
};
