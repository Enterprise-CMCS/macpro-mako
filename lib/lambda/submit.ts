import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "aws-lambda";
import {
  getAuthDetails,
  isAuthorized,
  lookupUserAttributes,
} from "../libs/api/auth/user";

import {
  Action,
  Authority,
  SEATOOL_AUTHORITIES,
  onemacSchema,
} from "shared-types";
import {
  getAvailableActions,
  getNextBusinessDayTimestamp,
  seaToolFriendlyTimestamp,
} from "shared-utils";
import { produceMessage } from "../libs/api/kafka";
import { getPackage } from "../libs/api/package";

const secretName = process.env.dbInfoSecretName;
if (!secretName) {
  throw new Error("Environment variable dbInfoSecretName is not set");
}

export const submit = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: "Event body required",
    });
  }

  // TODO: We should really type this, is would be hard, but not impossible
  const body = JSON.parse(event.body);
  console.log(body);

  if (!(await isAuthorized(event, body.state))) {
    return response({
      statusCode: 403,
      body: { message: "Unauthorized" },
    });
  }

  const activeSubmissionTypes = [
    Authority.CHIP_SPA,
    Authority.MED_SPA,
    Authority["1915b"],
    Authority["1915c"], // We accept amendments, renewals, and extensions for Cs
  ];
  if (!activeSubmissionTypes.includes(body.authority)) {
    return response({
      statusCode: 400,
      body: {
        message: `OneMAC Submissions API does not support the following authority: ${body.authority}`,
      },
    });
  }

  const authDetails = getAuthDetails(event);
  const userAttr = await lookupUserAttributes(
    authDetails.userId,
    authDetails.poolId,
  );

  if (
    [Authority["1915b"], Authority["1915c"]].includes(body.authority) &&
    body.seaActionType === "Extend"
  ) {
    console.log("Received a new temporary extension sumbission");

    // Check that this action can be performed on the original waiver
    const originalWaiver = await getPackage(body.originalWaiverNumber);
    console.log(originalWaiver);
    const originalWaiverAvailableActions: Action[] = getAvailableActions(
      userAttr,
      originalWaiver._source,
    );
    if (!originalWaiverAvailableActions.includes(Action.TEMP_EXTENSION)) {
      const actionType = Action.TEMP_EXTENSION;
      const id = body.originalWaiverNumber;
      console.log(
        `Package ${body.originalWaiverNumber} is not a candidate to receive a Temporary Extension`,
      );
      return response({
        statusCode: 401,
        body: {
          message: `You are not authorized to perform ${actionType} on ${id}`,
        },
      });
    }
    const authorityId = findAuthorityIdByName(body.authority);

    const item = {
      ...body,
      authorityId, // TODO: is this actually used?
      submissionDate: getNextBusinessDayTimestamp(),
      statusDate: seaToolFriendlyTimestamp(),
      changedDate: Date.now(),
    };
    // Safe parse the body
    const eventBody = onemacSchema.safeParse(item);
    if (!eventBody.success) {
      return console.log(
        "MAKO Validation Error. The following record failed to parse: ",
        JSON.stringify(eventBody),
        "Because of the following Reason(s): ",
        eventBody.error.message,
      );
    }
    console.log(
      "Safe parsed event body" + JSON.stringify(eventBody.data, null, 2),
    );

    await produceMessage(
      process.env.topicName as string,
      body.id,
      JSON.stringify(eventBody.data),
    );

    return response({
      statusCode: 200,
      body: { message: "success" },
    });
  }

  try {
    // We first parse the event; if it's malformed, this will throw an error before we touch seatool or kafka
    const eventBody = onemacSchema.safeParse(body);
    if (!eventBody.success) {
      return console.log(
        "MAKO Validation Error. The following record failed to parse: ",
        JSON.stringify(eventBody),
        "Because of the following Reason(s): ",
        eventBody.error.message,
      );
    }

    await produceMessage(
      process.env.topicName as string,
      body.id,
      JSON.stringify(eventBody.data),
    );

    return response({
      statusCode: 200,
      body: { message: "success" },
    });
  } catch (err) {
    console.error("Error whilst interacting with kafka:", err);
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};

function findAuthorityIdByName(authority: string): string | undefined {
  const entries = Object.entries(SEATOOL_AUTHORITIES);
  for (const [key, value] of entries) {
    if (value.toLowerCase() === authority.toLowerCase()) {
      return key;
    }
  }
  // Return undefined if no match is found
  return undefined;
}

export const handler = submit;
