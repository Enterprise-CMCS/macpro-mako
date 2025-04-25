import { APIGatewayEvent } from "aws-lambda";
import { response } from "libs/handler-lib";
import { getAvailableActions } from "shared-utils";

import {
  getAuthDetails,
  isAuthorizedToGetPackageActions,
  lookupUserAttributes,
} from "../libs/api/auth/user";
import { getPackage } from "../libs/api/package/getPackage";
import { getLatestActiveRoleByEmail } from "./user-management/userManagementService";
import { handleOpensearchError } from "./utils";

export const getPackageActions = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }

  try {
    const body = JSON.parse(event.body);

    const result = await getPackage(body.id);

    if (result === undefined || !result.found) {
      return response({
        statusCode: 404,
        body: { message: "No record found for the given id" },
      });
    }

    const passedStateAuth = await isAuthorizedToGetPackageActions(event, result._source.state);

    if (!passedStateAuth)
      return response({
        statusCode: 401,
        body: { message: "Not authorized to view resources from this state" },
      });

    const authDetails = getAuthDetails(event);
    const userAttr = await lookupUserAttributes(authDetails.userId, authDetails.poolId);
    const activeRole = await getLatestActiveRoleByEmail(userAttr.email);

    if (!activeRole) {
      return response({
        statusCode: 400,
        body: {
          message: "No active role found for user",
        },
      });
    }

    return response({
      statusCode: 200,
      body: {
        actions: getAvailableActions({ ...userAttr, role: activeRole.role }, result._source),
      },
    });
  } catch (err) {
    return response(handleOpensearchError(err));
  }
};
export const handler = getPackageActions;
