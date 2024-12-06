import { events } from "shared-types/events";
import { isAuthorized, getAuthDetails, lookupUserAttributes } from "libs/api/auth/user";
import { type APIGatewayEvent } from "aws-lambda";
import { itemExists } from "libs/api/package";

export const appK = async (event: APIGatewayEvent) => {
  if (!event.body) return;

  const parsedResult = events["app-k"].baseSchema.safeParse(JSON.parse(event.body));
  if (!parsedResult.success) {
    throw parsedResult.error;
  }

  // This is the backend check for auth
  if (!(await isAuthorized(event, parsedResult.data.id.slice(0, 2)))) {
    throw "Unauthorized";
  }

  // This is the backend check for the item already existing
  if (await itemExists({ id: parsedResult.data.id })) {
    throw "Item Already Exists";
  }

  const authDetails = getAuthDetails(event);
  const userAttr = await lookupUserAttributes(authDetails.userId, authDetails.poolId);
  const submitterEmail = userAttr.email;
  const submitterName = `${userAttr.given_name} ${userAttr.family_name}`;

  const transformedData = events["app-k"].schema.parse({
    ...parsedResult.data,
    submitterName,
    submitterEmail,
    timestamp: Date.now(),
  });

  return transformedData;
};
