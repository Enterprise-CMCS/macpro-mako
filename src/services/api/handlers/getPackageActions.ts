import { APIGatewayEvent } from "aws-lambda";
import { getAvailableActions } from "shared-utils";
import { getPackage } from "../libs/package/getPackage";
import {
  getAuthDetails,
  isAuthorizedToGetPackageActions,
  lookupUserAttributes,
} from "../libs/auth/user";
import { response } from "../libs/handler";
import { getAppkChildren } from "../libs/package";
import { Action } from "shared-types";

type GetPackageActionsBody = {
  id: string;
};

export const getPackageActions = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }
  const body = JSON.parse(event.body) as GetPackageActionsBody;
  try {
    const result = await getPackage(body.id);
    const passedStateAuth = await isAuthorizedToGetPackageActions(
      event,
      result._source.state,
    );
    if (!passedStateAuth)
      return response({
        statusCode: 401,
        body: { message: "Not authorized to view resources from this state" },
      });
    if (!result.found)
      return response({
        statusCode: 404,
        body: { message: "No record found for the given id" },
      });
    const authDetails = getAuthDetails(event);
    const userAttr = await lookupUserAttributes(
      authDetails.userId,
      authDetails.poolId,
    );

    if (!result._source.appkParent) {
      return response({
        statusCode: 200,
        body: {
          actions: getAvailableActions(userAttr, result._source),
        },
      });
    }

    // Actions available on an appk need to consider child waivers, so they're handled differently
    const appkChildren = await getAppkChildren(result._source.id);
    const allAppkMembers = [result, ...appkChildren.hits.hits];

    const allActions = [result, ...appkChildren.hits.hits].map((child) =>
      getAvailableActions(userAttr, child._source as any),
    );

    // only want common actions; omit actions not in every appk package
    let commonActions = allActions.reduce((acc, currentActions, index) => {
      if (index === 0) return currentActions;
      return acc.filter((action) => currentActions.includes(action));
    }, []);
    // Remove RAI actions unless the RAI requested date is identical across all appk members
    // Scenario: If the parent and the children all have respond to rai as an available action
    //           But one of those children's latest rai has a different requested date (raitable in seetool)
    //           There's drift, and there will be a failure when going to write the response
    //           Further, we can't reliably know what RAI is correct.
    const allRaiRequestedDates = allAppkMembers.map(
      (member) => member._source.raiRequestedDate,
    );
    const isRaiRequestedDateIdentical = allRaiRequestedDates.every(
      (date, _, arr) => date === arr[0],
    );
    if (!isRaiRequestedDateIdentical) {
      const actionsToRemove = [
        Action.RESPOND_TO_RAI,
        Action.WITHDRAW_RAI,
        Action.ISSUE_RAI,
      ];
      commonActions = commonActions.filter(
        (action) => !actionsToRemove.includes(action),
      );
    }

    return response({
      statusCode: 200,
      body: {
        actions: commonActions,
      },
    });
  } catch (err) {
    console.error({ err });
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};
export const handler = getPackageActions;
