import { CognitoUserAttributes } from "shared-types";

const isAdmin = (user: CognitoUserAttributes) => {
  const userRoles = user["custom:roles"];
  const CMS_ADMIN_ROLES = ["cms-admin"]; // this is prob wrong

  for (let i = 0; i < userRoles.length; i++) {
    const userRole = userRoles[i];
    if (CMS_ADMIN_ROLES.indexOf(userRole) >= 0) {
      return true;
    }
  }
  return false;
};

export const getUserStateCodes = (
  user: CognitoUserAttributes | null | undefined
) => {
  if (!user) return [];

  if (isAdmin(user)) {
    return ["ALL", ...allStateAbbr];
  }

  return user["custom:state_codes"];
};

const allStateAbbr = [
  "AL",
  "AK",
  "AS",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "DC",
  "FM",
  "FL",
  "GA",
  "GU",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MH",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "MP",
  "OH",
  "OK",
  "OR",
  "PW",
  "PA",
  "PR",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VI",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];
