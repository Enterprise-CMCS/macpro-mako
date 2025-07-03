import { zodValidator } from "@dannywrayuk/middy-zod-validator";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { createError } from "@middy/util";
import { APIGatewayEvent } from "shared-types";
import { Territory } from "shared-types/events/legacy-user";
import { z } from "zod";

import { canViewUser, ContextWithCurrUser, isAuthenticated, normalizeEvent } from "../middleware";
import { getAllUserRolesByEmail, getApproversByRole } from "./userManagementService";

export const getApproversEventSchema = z
  .object({
    body: z.object({
      userEmail: z.string().email().optional(),
    }),
  })
  .passthrough();

export type GetApproversEvent = APIGatewayEvent & z.infer<typeof getApproversEventSchema>;

export const handler = middy()
  .use(httpErrorHandler())
  .use(normalizeEvent({ opensearch: true }))
  .use(httpJsonBodyParser())
  .use(zodValidator({ eventSchema: getApproversEventSchema }))
  .use(isAuthenticated({ setToContext: true }))
  .use(canViewUser())
  .handler(async (event: GetApproversEvent, context: ContextWithCurrUser) => {
    const email = event?.body?.userEmail || context?.currUser?.email;

    if (!email) {
      console.error("Email is undefined");
      throw createError(500, JSON.stringify({ message: "Internal server error" }), {
        expose: true,
      });
    }

    let userRoles;
    try {
      userRoles = await getAllUserRolesByEmail(email);
    } catch (err) {
      console.error(err);
      throw createError(500, JSON.stringify({ message: "Internal server error" }), {
        expose: true,
      });
    }

    const roleStateMap = new Map<string, Territory[]>();

    // we make a map for state submitters but also use the roles for all other users
    if (userRoles) {
      userRoles.forEach(({ role, territory }) => {
        if (!roleStateMap.has(role)) {
          roleStateMap.set(role, []);
        }
        roleStateMap.get(role)!.push(territory);
      });
    }

    // loop through roles
    const approverList = [];

    for (const [role, territories] of roleStateMap.entries()) {
      try {
        const allApprovers = await getApproversByRole(role); // pass in the role of current user NOT approving role
        const filtered =
          role === "statesubmitter"
            ? allApprovers.filter((approver) =>
                territories.includes(approver.territory.toUpperCase() as Territory),
              )
            : allApprovers;
        approverList.push({
          role: role,
          territory: territories,
          approvers: filtered,
        });
      } catch (err) {
        console.log("ERROR: ", err);
        approverList.push({
          role: role,
          territory: territories,
          approvers: [
            { id: "error", fullName: "Error Fetching Approvers", email: "", territory: "N/A" },
          ],
        });
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Approver list successfully retrieved.",
        approverList: approverList,
      }),
    };
  });
