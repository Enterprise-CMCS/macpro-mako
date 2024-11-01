import { APIGatewayEvent } from "aws-lambda";
import { getAuthDetails, lookupUserAttributes } from "lib/libs/api/auth/user";
import { itemExists } from "lib/libs/api/package";
import { events } from "lib/packages/shared-types";

export const uploadSubsequentDocuments = async (event: APIGatewayEvent) => {
  if (event.body === null) return;

  const parsedResult = events[
    "upload-subsequent-documents"
  ].baseSchema.safeParse(JSON.parse(event.body));

  if (parsedResult.success === false) {
    throw parsedResult.error;
  }

  if ((await itemExists({ id: parsedResult.data.id })) === false) {
    throw "Item Doesn't Exist";
  }

  const authDetails = getAuthDetails(event);
  const userAttr = await lookupUserAttributes(
    authDetails.userId,
    authDetails.poolId,
  );

  const submitterEmail = userAttr.email;
  const submitterName = `${userAttr.given_name} ${userAttr.family_name}`;

  const transformedData = events["upload-subsequent-documents"].schema.parse({
    ...parsedResult.data,
    submitterName,
    submitterEmail,
    timestamp: Date.now(),
  });

  return transformedData;
};
