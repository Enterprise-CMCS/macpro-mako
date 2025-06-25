import { getAuthDetails, lookupUserAttributes } from "libs/api/auth/user";
import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "shared-types";
import { z } from "zod";

import { getAllUserRolesByEmail, getLatestActiveRoleByEmail } from "./userManagementService";

export const getUserProfileSchema = z.object({
  userEmail: z.string().email().optional(),
});

export const getUserProfile = async (event: APIGatewayEvent) => {
  if (!event?.requestContext) {
    return response({
      statusCode: 400,
      body: { message: "Request context required" },
    });
  }
  let currAuthDetails;
  try {
    currAuthDetails = getAuthDetails(event);
  } catch (err) {
    console.error(err);
    return response({
      statusCode: 401,
      body: { message: "User not authenticated" },
    });
  }

  try {
    const { userId, poolId } = currAuthDetails;
    const currUserAttributes = await lookupUserAttributes(userId, poolId);

    const eventBody = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const safeEventBody = getUserProfileSchema.safeParse(eventBody);
    console.log("safeEventBody", JSON.stringify(safeEventBody, null, 2));

    // if the event has a body with a userEmail, the userEmail is not the same as
    // the current user's email, and the current user is a user manager, then
    // return the data for the userEmail instead of the current user
    if (
      safeEventBody.success &&
      safeEventBody?.data?.userEmail &&
      safeEventBody.data.userEmail !== currUserAttributes.email
    ) {
      const currUserLatestActiveRoleObj = await getLatestActiveRoleByEmail(
        currUserAttributes.email,
      );
      if (
        ["systemadmin", "statesystemadmin", "cmsroleapprover", "helpdesk"].includes(
          currUserLatestActiveRoleObj?.role,
        )
      ) {
        const reqUserRoles = await getAllUserRolesByEmail(safeEventBody.data.userEmail);
        return response({
          statusCode: 200,
          body: reqUserRoles,
        });
      }
    }

    const currUserRoles = await getAllUserRolesByEmail(currUserAttributes.email);

    return response({
      statusCode: 200,
      body: currUserRoles,
    });
  } catch (err: unknown) {
    console.log("An error occurred: ", err);
    return response({
      statusCode: 500,
      body: { message: `Error: ${err}` },
    });
  }
};

export const handler = getUserProfile;
