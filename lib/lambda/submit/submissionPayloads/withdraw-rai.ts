import { events } from "shared-types/events";
import {
  isAuthorized,
  getAuthDetails,
  lookupUserAttributes,
} from "../../../libs/api/auth/user";
import { type APIGatewayEvent } from "aws-lambda";
import { itemExists } from "libs/api/package";

export const withdrawRai = async (event: APIGatewayEvent) => {
  console.log('start of withdrawRai func')
  if (!event.body) return;

  const parsedResult = events["withdraw-rai"].baseSchema.safeParse(
    JSON.parse(event.body),
  );
  console.log(parsedResult, 'PARSED RESULT')
  if (!parsedResult.success) {
    throw parsedResult.error;
  }

  // This is the backend check for auth
  if (!(await isAuthorized(event, parsedResult.data.id.slice(0, 2)))) {
    console.log('in this isAuthorized')
    throw "Unauthorized";
  }

  // This is the backend check for the item already existing
  if (await itemExists({ id: parsedResult.data.id })) {
    throw "Item Already Exists";
  }

  const authDetails = getAuthDetails(event);
  console.log(authDetails, 'AUTH DETAILS')
  const userAttr = await lookupUserAttributes(
    authDetails.userId,
    authDetails.poolId,
  );
  console.log(userAttr, 'USER ATTR')
  const submitterEmail = userAttr.email;
  const submitterName = `${userAttr.given_name} ${userAttr.family_name}`;

  const transformedData = events["withdraw-rai"].schema.parse({
    ...parsedResult.data,
    submitterName,
    submitterEmail,
    timestamp: Date.now(),
  });

  return transformedData;
};
