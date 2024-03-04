import { CognitoUserAttributes } from "shared-types";
import { z } from "zod";

export const indentitiesSchema = z.array(
  z.object({
    dateCreated: z.string(),
    issuer: z.string().nullable(),
    primary: z
      .string()
      .transform((primary) => primary.toLowerCase() === "true"),
    providerName: z.string(),
    providerType: z.string(),
    userId: z.string(),
  })
);

export const isIDM = (identities: CognitoUserAttributes["identities"]) => {
  if (!identities) return false;

  let parsedIdentities: unknown;

  try {
    parsedIdentities = JSON.parse(identities ?? "");
  } catch (err: unknown) {
    return false;
  }

  const result = indentitiesSchema.safeParse(parsedIdentities);

  if (result.success === true) {
    const foundIdm = result.data.some(
      (identity) => identity.providerName === "IDM"
    );

    return foundIdm;
  } else {
    return false;
  }
};
