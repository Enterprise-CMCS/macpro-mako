import { type APIGatewayEvent } from "aws-lambda";
import { itemExists } from "libs/api/package";
import { events } from "shared-types/events";

import { getAuthDetails, isAuthorized, lookupUserAttributes } from "../../../libs/api/auth/user";

export const capitatedInitial = async (event: APIGatewayEvent) => {
  if (!event.body) return;

  const parsedResult = events["capitated-initial"].baseSchema.safeParse(JSON.parse(event.body));
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

  const transformedData = events["capitated-initial"].schema.parse({
    ...parsedResult.data,
    submitterName,
    submitterEmail,
    timestamp: Date.now(),
  });

  return transformedData;
};
