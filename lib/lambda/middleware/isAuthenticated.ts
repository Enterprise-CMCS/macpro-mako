import { Request } from "@middy/core";
import { createError } from "@middy/util";
import { getAuthDetails, lookupUserAttributes } from "libs/api/auth/user";
import { FullUser } from "shared-types";
import { isCmsUser } from "shared-utils";

import {
  getAllUserRolesByEmail,
  getLatestActiveRoleByEmail,
  getUserByEmail,
} from "../user-management/userManagementService";
import { setUser } from "./utils";

export const isAuthenticated = () => ({
  before: async (request: Request) => {
    let authDetails;
    try {
      authDetails = getAuthDetails(request.event);
      if (!authDetails || !authDetails.userId || !authDetails.poolId) {
        throw new Error("No user or pool id");
      }
    } catch (err) {
      console.error(err);
      throw createError(401, JSON.stringify({ message: "User not authenticated" }));
    }

    const { userId, poolId } = authDetails;
    const userAttributes = await lookupUserAttributes(userId, poolId);
    if (!userAttributes?.email) {
      // if you don't use the expose option here, you won't be able to see the error message
      throw createError(500, JSON.stringify({ message: "User is not valid" }), { expose: true });
    }
    const { email } = userAttributes;

    const latestActiveRole = await getLatestActiveRoleByEmail(email);
    if (!latestActiveRole) {
      throw createError(403, JSON.stringify({ message: "User is not authorized" }));
    }

    const userProfile = await getAllUserRolesByEmail(email);
    const activeRoles = userProfile.filter((role) => role.status === "active");

    const userDetails = await getUserByEmail(email);

    const cognitoUser: FullUser = {
      ...userAttributes,
      role: latestActiveRole.role ?? "norole",
      states: [],
    };

    if (!isCmsUser(cognitoUser)) {
      cognitoUser.states = Array.from(
        new Set(activeRoles.map((role) => role.territory.toUpperCase())),
      );
    }

    setUser(
      {
        cognitoUser,
        userDetails,
        userProfile,
      },
      request,
    );
  },
});
