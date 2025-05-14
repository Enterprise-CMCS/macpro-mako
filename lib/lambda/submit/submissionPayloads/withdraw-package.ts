import { type APIGatewayEvent } from "aws-lambda";
import { itemExists } from "libs/api/package";
import { events } from "shared-types/events";

import { getAuthDetails, isAuthorized, lookupUserAttributes } from "../../../libs/api/auth/user";
import { getUserByEmail } from "../../user-management/userManagementService";

export const withdrawPackage = async (event: APIGatewayEvent) => {
  if (!event.body) return;

  const parsedResult = events["withdraw-package"].baseSchema.safeParse(JSON.parse(event.body));

  if (!parsedResult.success) {
    throw parsedResult.error;
  }

  // This is the backend check for auth
  if (!(await isAuthorized(event, parsedResult.data.id.slice(0, 2)))) {
    throw "Unauthorized";
  }

  // TODO: refactor for this action
  if (!(await itemExists({ id: parsedResult.data.id }))) {
    throw "Item doesn't exist";
  }

  const authDetails = getAuthDetails(event);
  const userAttr = await lookupUserAttributes(authDetails.userId, authDetails.poolId);
  const submitterEmail = userAttr.email;
  const user = await getUserByEmail(submitterEmail);

  if (!user) {
    throw new Error("User does not exist in User OpenSearch Index");
  }

  const transformedData = events["withdraw-package"].schema.parse({
    ...parsedResult.data,
    submitterName: user.fullName,
    submitterEmail: user.email,
    timestamp: Date.now(),
  });

  return transformedData;
};
