import { events } from "shared-types/events";
import { isAuthorized, getAuthDetails, lookupUserAttributes } from "../../../libs/api/auth/user";
import { type APIGatewayEvent } from "aws-lambda";
import { itemExists } from "libs/api/package";
import { getDomain, getNamespace } from "libs/utils";
import * as os from "libs/opensearch-lib";

export const respondToRai = async (event: APIGatewayEvent) => {
  if (!event.body) return;

  const parsedResult = events["respond-to-rai"].baseSchema.safeParse(JSON.parse(event.body));
  if (!parsedResult.success) {
    throw parsedResult.error;
  }

  // This is the backend check for auth
  if (!(await isAuthorized(event, parsedResult.data.id.slice(0, 2)))) {
    throw "Unauthorized";
  }

  // This is the backend check for the item already existing
  if (!(await itemExists({ id: parsedResult.data.id }))) {
    throw "Item Doesn't Exist";
  }

  const item = await os.getItem(getDomain(), getNamespace("main"), parsedResult.data.id);
  const authDetails = getAuthDetails(event);
  const userAttr = await lookupUserAttributes(authDetails.userId, authDetails.poolId);
  const submitterEmail = userAttr.email;
  const submitterName = `${userAttr.given_name} ${userAttr.family_name}`;

  const transformedData = events["respond-to-rai"].schema.parse({
    ...parsedResult.data,
    authority: item?._source.authority,
    submitterName,
    submitterEmail,
    timestamp: Date.now(),
  });

  return transformedData;
};
