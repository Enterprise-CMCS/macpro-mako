import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { createError } from "@middy/util";
import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "shared-types";
import { roles } from "shared-types/opensearch";
import { isUserManagerUser } from "shared-utils";

import { ContextWithCurrUser, isAuthenticated, normalizeEvent } from "../middleware";
import {
  getAllUserRoles,
  getAllUserRolesByEmail,
  getAllUserRolesByState,
  getUserRolesWithNames,
} from "./userManagementService";

const getActiveRole = (roles: roles.Document[], roleName: string) =>
  roles.find((roleObj) => roleObj.role === roleName && roleObj.status === "active");

export const handler = middy()
  .use(httpErrorHandler())
  .use(normalizeEvent({ opensearch: true }))
  .use(httpJsonBodyParser())
  .use(isAuthenticated({ setToContext: true }))
  .handler(async (event: APIGatewayEvent, context: ContextWithCurrUser) => {
    const { currUser } = context;

    if (!currUser?.email) {
      console.error("Email is undefined");
      throw createError(500, JSON.stringify({ message: "Internal server error" }), {
        expose: true,
      });
    }

    // get all of the roles for the current user
    let userRoles;
    try {
      userRoles = await getAllUserRolesByEmail(currUser.email);
    } catch (err) {
      console.error(err);
      throw createError(500, JSON.stringify({ message: "Internal server error" }), {
        expose: true,
      });
    }

    const approverRoles = userRoles.filter(
      (roleObj) =>
        isUserManagerUser({ ...currUser, role: roleObj.role }) && roleObj?.status === "active",
    );

    if (approverRoles.length <= 0) {
      return response({
        statusCode: 403,
        body: { message: "User is not authorized to approve roles" },
      });
    }

    let roleRequests: roles.Document[] = [];
    try {
      if (getActiveRole(approverRoles, "systemadmin") || getActiveRole(approverRoles, "helpdesk")) {
        roleRequests = await getAllUserRoles();
      } else if (getActiveRole(approverRoles, "cmsroleapprover")) {
        roleRequests = await getAllUserRoles();

        // cmsroleapprovers can only see statesystemadmin requests
        roleRequests = roleRequests.filter((roleObj) => roleObj?.role === "statesystemadmin");
      } else {
        const stateSystemAdmin = getActiveRole(approverRoles, "statesystemadmin");

        if (stateSystemAdmin) {
          roleRequests = await getAllUserRolesByState(stateSystemAdmin?.territory);

          // statesystemadmins cannot update other statesystemadmin requests
          roleRequests = roleRequests.filter((roleObj) => roleObj?.role !== "statesystemadmin");
        }
      }
    } catch (err) {
      console.error(err);
      throw createError(500, JSON.stringify({ message: "Internal server error" }), {
        expose: true,
      });
    }

    // filter out the current user from the role requests
    roleRequests = roleRequests.filter((adminRole) => adminRole?.email !== currUser.email);

    if (!roleRequests.length) {
      return {
        statusCode: 200,
        body: JSON.stringify([]),
      };
    }

    try {
      const roleRequestsWithName = await getUserRolesWithNames(roleRequests);

      return {
        statusCode: 200,
        body: JSON.stringify(roleRequestsWithName),
      };
    } catch (err) {
      console.error(err);
      throw createError(500, JSON.stringify({ message: "Internal server error" }), {
        expose: true,
      });
    }
  });
