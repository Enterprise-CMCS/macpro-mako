import { APIGatewayEvent } from "aws-lambda";
import { isActiveDraftPackage, isActiveMainNonDraftPackage } from "libs/api/package/packageStatus";
import { response } from "libs/handler-lib";
import { SEATOOL_STATUS } from "shared-types";
import { getAvailableActions, isCmsUser } from "shared-utils";

import {
  getAuthDetails,
  isAuthorizedToGetPackageActions,
  lookupUserAttributes,
} from "../libs/api/auth/user";
import { getDraftPackage, getPackage } from "../libs/api/package/getPackage";
import { getLatestActiveRoleByEmail } from "./user-management/userManagementService";
import { handleOpensearchError } from "./utils";

export const getPackageActions = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }

  let body: { id?: unknown };
  try {
    body = JSON.parse(event.body);
  } catch {
    return response({
      statusCode: 400,
      body: { message: "Event body must be valid JSON" },
    });
  }

  try {
    const normalizedId = typeof body?.id === "string" ? body.id.trim() : "";
    if (!normalizedId) {
      return response({
        statusCode: 400,
        body: { message: "Valid id is required" },
      });
    }

    const mainResult = await getPackage(normalizedId);
    const hasActiveMainNonDraft = isActiveMainNonDraftPackage(mainResult);

    const draftResult = hasActiveMainNonDraft ? undefined : await getDraftPackage(normalizedId);
    const hasActiveDraft = isActiveDraftPackage(draftResult);
    const result = hasActiveMainNonDraft ? mainResult : hasActiveDraft ? draftResult : undefined;

    if (result === undefined || !result.found) {
      return response({
        statusCode: 404,
        body: { message: "No record found for the given id" },
      });
    }

    const authDetails = getAuthDetails(event);
    const userAttr = await lookupUserAttributes(authDetails.userId, authDetails.poolId);
    const activeRole = await getLatestActiveRoleByEmail(userAttr.email);

    if (!activeRole) {
      return response({
        statusCode: 401,
        body: {
          message: "No active role found for user",
        },
      });
    }

    const user = { ...userAttr, role: activeRole.role };

    if (result._source.seatoolStatus === SEATOOL_STATUS.DRAFT && isCmsUser(user)) {
      return response({
        statusCode: 404,
        body: { message: "No record found for the given id" },
      });
    }

    const passedStateAuth = await isAuthorizedToGetPackageActions(event, result._source.state);

    if (!passedStateAuth)
      return response({
        statusCode: 403,
        body: { message: "Not authorized to view resources from this state" },
      });

    return response({
      statusCode: 200,
      body: {
        actions: getAvailableActions(user, result._source),
      },
    });
  } catch (err) {
    return response(handleOpensearchError(err));
  }
};
export const handler = getPackageActions;
