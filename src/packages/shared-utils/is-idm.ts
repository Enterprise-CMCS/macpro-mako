import { CognitoUserAttributes, indentitiesSchema } from "shared-types";

export const isIDM = (identities: CognitoUserAttributes["identities"]) => {
  const result = indentitiesSchema.safeParse(identities);

  if (result.success === true) {
    // do more work to determine if isIdm
    const foundIdm = result.data.some(
      (identity) => identity.providerName === "IDM"
    );

    return foundIdm;
  } else {
    // if identities don't exist it can't be IDM
    return false;
  }
};
