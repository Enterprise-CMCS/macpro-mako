import { APIGatewayEvent } from "aws-lambda";
import { getAuthDetails, lookupUserAttributes } from "libs/api/auth/user";
import { itemExists } from "libs/api/package";
import { events } from "shared-types";

import { getUserByEmail } from "../../user-management/userManagementService";

export const uploadSubsequentDocuments = async (event: APIGatewayEvent) => {
  if (event.body === null) return;

  const parsedResult = events["upload-subsequent-documents"].baseSchema.safeParse(
    JSON.parse(event.body),
  );

  if (parsedResult.success === false) {
    throw parsedResult.error;
  }

  if ((await itemExists({ id: parsedResult.data.id })) === false) {
    throw "Item Doesn't Exist";
  }

  const authDetails = getAuthDetails(event);
  const userAttr = await lookupUserAttributes(authDetails.userId, authDetails.poolId);

  const submitterEmail = userAttr.email;
  const user = await getUserByEmail(submitterEmail);

  if (!user) {
    throw new Error("User does not exist in User OpenSearch Index");
  }

  const transformedData = events["upload-subsequent-documents"].schema.parse({
    ...parsedResult.data,
    submitterName: user.fullName,
    submitterEmail: user.email,
    timestamp: Date.now(),
  });

  return transformedData;
};
