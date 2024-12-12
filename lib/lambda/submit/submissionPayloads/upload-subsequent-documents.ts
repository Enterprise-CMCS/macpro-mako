import { APIGatewayEvent } from "aws-lambda";
import { itemExists } from "libs/api/package";
import { events } from "shared-types";
import { getAuthDetails, lookupUserAttributes } from "libs/api/auth/user";

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
