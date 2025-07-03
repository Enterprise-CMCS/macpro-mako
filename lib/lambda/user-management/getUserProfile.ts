import { zodValidator } from "@dannywrayuk/middy-zod-validator";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { createError } from "@middy/util";
import { APIGatewayEvent } from "shared-types";
import { z } from "zod";

import { canViewUser, ContextWithCurrUser, isAuthenticated, normalizeEvent } from "../middleware";
import { getAllUserRolesByEmail } from "./userManagementService";

export const getUserProfileEventSchema = z
  .object({
    body: z.object({
      userEmail: z.string().email().optional(),
    }),
  })
  .passthrough();

export type GetUserProfileEvent = APIGatewayEvent & z.infer<typeof getUserProfileEventSchema>;

export const handler = middy()
  .use(httpErrorHandler())
  .use(normalizeEvent({ opensearch: true }))
  .use(httpJsonBodyParser())
  .use(zodValidator({ eventSchema: getUserProfileEventSchema }))
  .use(isAuthenticated({ setToContext: true }))
  .use(canViewUser())
  .handler(async (event: GetUserProfileEvent, context: ContextWithCurrUser) => {
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

    return {
      statusCode: 200,
      body: JSON.stringify(userRoles),
    };
  });
