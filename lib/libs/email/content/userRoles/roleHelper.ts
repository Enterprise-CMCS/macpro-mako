// TODO: this should probably go in shared types

export enum userRoleType {
  defaultcmsuser = "defaultcmsuser",
  cmsroleapprover = "cmsroleapprover",
  cmsreviewer = "cmsreviewer",
  statesystemadmin = "statesystemadmin",
  systemadmin = "systemadmin",
  helpdesk = "helpdesk",
  statesubmitter = "statesubmitter",
}

export const statusMap = {
  pending: "pending",
  active: "granted",
  denied: "denied",
  revoked: "revoked",
};

export const userRoleMap: Record<userRoleType, string> = {
  defaultcmsuser: "Default CMS User Placeholder",
  cmsroleapprover: "CMS Role Approver",
  cmsreviewer: "CMS Reviewer",
  statesystemadmin: "State System Admin",
  systemadmin: "System Admin",
  helpdesk: "Helpdesk",
  statesubmitter: "State Submitter",
};

export const approvingUserRole: Partial<Record<userRoleType, userRoleType>> = {
  statesubmitter: userRoleType.statesystemadmin,
  statesystemadmin: userRoleType.cmsroleapprover,
  cmsroleapprover: userRoleType.systemadmin,
  defaultcmsuser: userRoleType.statesystemadmin,
  helpdesk: userRoleType.systemadmin,
  cmsreviewer: userRoleType.cmsroleapprover,
};

export function getApprovingUserRoleLabel(role: userRoleType): string | undefined {
  const approvingRole = approvingUserRole[role];
  if (!approvingRole) return undefined;
  return userRoleMap[approvingRole];
}

export const statesMap = {
  AL: "Alabama",
  KY: "Kentucky",
  OH: "Ohio",
  AK: "Alaska",
  LA: "Louisiana",
  OK: "Oklahoma",
  AZ: "Arizona",
  ME: "Maine",
  OR: "Oregon",
  AR: "Arkansas",
  MD: "Maryland",
  PA: "Pennsylvania",
  AS: "American Samoa",
  MA: "Massachusetts",
  PR: "Puerto Rico",
  CA: "California",
  MI: "Michigan",
  RI: "Rhode Island",
  CO: "Colorado",
  MN: "Minnesota",
  SC: "South Carolina",
  CT: "Connecticut",
  MS: "Mississippi",
  SD: "South Dakota",
  DE: "Delaware",
  MO: "Missouri",
  TN: "Tennessee",
  DC: "District of Columbia",
  MT: "Montana",
  TX: "Texas",
  FL: "Florida",
  NE: "Nebraska",
  TT: "Trust Territories",
  GA: "Georgia",
  NV: "Nevada",
  UT: "Utah",
  GU: "Guam",
  NH: "New Hampshire",
  VT: "Vermont",
  HI: "Hawaii",
  NJ: "New Jersey",
  VA: "Virginia",
  ID: "Idaho",
  NM: "New Mexico",
  VI: "Virgin Islands",
  IL: "Illinois",
  NY: "New York",
  WA: "Washington",
  IN: "Indiana",
  NC: "North Carolina",
  WV: "West Virginia",
  IA: "Iowa",
  ND: "North Dakota",
  WI: "Wisconsin",
  KS: "Kansas",
  MP: "Northern Mariana Islands",
  WY: "Wyoming",
  ZZ: "ZZ Test Data",
};
