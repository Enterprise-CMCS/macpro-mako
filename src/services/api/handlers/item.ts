import { response } from "../libs/handler";
import { APIGatewayEvent } from "aws-lambda";
import * as os from "../../../libs/opensearch-lib";
import {
  getAuthDetails,
  getStateFilter,
  lookupUserAttributes,
} from "../libs/auth/user";
import {
  OsHit,
  OsMainSourceItem,
  Action,
  CognitoUserAttributes,
} from "shared-types";
import { isCmsUser } from "shared-utils";

if (!process.env.osDomain) {
  throw "ERROR:  osDomain env variable is required,";
}

type ItemResult = OsHit<OsMainSourceItem> & {
  found: boolean;
  actions: Action[];
};

/** Generates an array of allowed actions from a combination of user attributes
 * and OS result data */
const packageActionsForResult = (
  user: CognitoUserAttributes,
  result: ItemResult
): Action[] => {
  const actions = [];
  if (isCmsUser(user)) {
    actions.push(Action.ENABLE_RAI_WITHDRAW);
  }
  return actions;
};

export const getItemData = async (event: APIGatewayEvent) => {
  try {
    const body = JSON.parse(event.body);

    // TODO: Can all this user stuff just happen in one swift go instead of multiple calls?
    const authDetails = getAuthDetails(event);
    const userAttr = await lookupUserAttributes(
      authDetails.userId,
      authDetails.poolId
    );
    const stateFilter = await getStateFilter(event);

    const result = (await os.getItem(
      process.env.osDomain,
      "main",
      body.id
    )) as ItemResult;

    // Get available actions based on user's role and result source
    result.actions = packageActionsForResult(userAttr, result);

    if (
      stateFilter &&
      !stateFilter.terms.state.includes(
        result._source.state.toLocaleLowerCase()
      )
    ) {
      return response({
        statusCode: 401,
        body: { message: "Not authorized to view this resource" },
      });
    }

    if (!result.found) {
      return response({
        statusCode: 404,
        body: { message: "No record found for the given id" },
      });
    } else {
      return response<unknown>({
        statusCode: 200,
        body: result,
      });
    }
  } catch (error) {
    console.error({ error });
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};

export const handler = getItemData;
