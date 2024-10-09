import { events } from "shared-types/events";
import {
  isAuthorized,
  getAuthDetails,
  lookupUserAttributes,
} from "../../../libs/api/auth/user";
import { type APIGatewayEvent } from "aws-lambda";

export const withdrawRai = async (event: APIGatewayEvent) => {
  if (!event.body) return;

  const parsedResult = events["withdraw-rai"].baseSchema.safeParse(
    JSON.parse(event.body),
  );

  if (!parsedResult.success) {
    throw parsedResult.error;
  }

  // This is the backend check for auth
  if (!(await isAuthorized(event, parsedResult.data.id.slice(0, 2)))) {
    throw "Unauthorized";
  }

  // TODO: refactor for this action
  // if (await itemExists({ id: parsedResult.data.id })) {
  //   throw "Item Already Exists";
  // }

  const authDetails = getAuthDetails(event);
  const userAttr = await lookupUserAttributes(
    authDetails.userId,
    authDetails.poolId,
  );
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
