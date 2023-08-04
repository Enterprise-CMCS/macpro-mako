import { response } from "../libs/handler";
import { APIGatewayEvent } from "aws-lambda";
import { getAuthDetails, lookupUserAttributes } from "../libs/auth/user";

import * as os from "./../../../libs/opensearch-lib";
import { isCmsUser } from "shared-utils";
if (!process.env.osDomain) {
  throw "ERROR:  osDomain env variable is required,";
}

// Handler function to get Seatool data
export const handler = async (event: APIGatewayEvent) => {
  try {
    // Retrieve authentication details of the user
    const authDetails = getAuthDetails(event);

    // Look up user attributes from Cognito
    const userAttributes = await lookupUserAttributes(
      authDetails.userId,
      authDetails.poolId
    );

    const body = JSON.parse(event.body);
    console.log(body);

    // Retrieve the state code from the path parameters
    const stateCode = body.state;

    // Check if stateCode is provided
    if (!stateCode) {
      return response({
        statusCode: 400,
        body: { message: "State code is missing" },
      });
    }

    // Check if user is authorized to access the resource based on their attributes
    if (
      !userAttributes ||
      (!isCmsUser(userAttributes) &&
        !userAttributes["custom:state"]?.includes(stateCode))
    ) {
      return response({
        statusCode: 403,
        body: { message: "User is not authorized to access this resource" },
      });
    }

    const stateMatcher = {
      match: {
        state: stateCode,
      },
    };
    const query = {
      query: {
        bool: {
          must: [
            stateMatcher,
            {
              match: {
                _id: body.id,
              },
            },
          ],
        },
      },
    };

    // // Retrieve Record
    const results = await os.search(process.env.osDomain, "main", query);

    // Check that the results array is exactly one.
    // This ensures the state given matches the record, and also retrieves the record.
    if (results.hits.length != 1) {
      return response({
        statusCode: 500,
        body: { message: "Unexpected data found for query." },
      });
    }

    // Check that the attachment details provided by the user exist in the record.
    // This works to ensure someone isn't maliciously sending us a good state and ID with an unassociated record.
    if (
      !results.hits[0]._source.attachments.some((e) => {
        return e.bucket === body.bucket && e.key === body.key;
      })
    ) {
      return response({
        statusCode: 500,
        body: { message: "Attachment details not found for given record id." },
      });
    }
    let log = "";
    // Now we can generate the presigned url
    log = process.env.onemacLegacyS3AccessRoleArn;

    return response<unknown>({
      statusCode: 200,
      body: { log },
    });
  } catch (error) {
    console.error({ error });
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};
