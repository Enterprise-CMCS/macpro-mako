import { createError } from "@middy/util";
import { APIGatewayEvent } from "aws-lambda";
import { produceMessage } from "libs/api/kafka";
import { z } from "zod";

import { authedMiddy, canViewUser, ContextWithCurrUser } from "../middleware";
import { getUserByEmail } from "./userManagementService";

export const submitGroupDivisionEventSchema = z
  .object({
    body: z.object({
      userEmail: z.string(),
      group: z.string(),
      division: z.string(),
    }),
  })
  .passthrough();

export type SubmitGroupDivisionEvent = APIGatewayEvent &
  z.infer<typeof submitGroupDivisionEventSchema>;

export const handler = authedMiddy({
  opensearch: true,
  kafka: true,
  setToContext: true,
  eventSchema: submitGroupDivisionEventSchema,
})
  .use(canViewUser())
  .handler(async (event: SubmitGroupDivisionEvent, context: ContextWithCurrUser) => {
    const { currUser } = context;
    const { userEmail, group, division } = event.body;
    const email = userEmail || currUser?.email;

    if (!email) {
      console.error("Email is undefined");
      throw createError(500, JSON.stringify({ message: "Internal server error" }), {
        expose: true,
      });
    }

    const userInfo = await getUserByEmail(email);

    if (!userInfo) {
      console.error("User is undefined");
      throw createError(500, JSON.stringify({ message: "Internal server error" }), {
        expose: true,
      });
    }

    await produceMessage(
      process?.env?.topicName || "",
      userInfo.id,
      JSON.stringify({
        eventType: "user-info",
        email,
        group,
        division,
        fullName: userInfo.fullName,
      }),
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Group and division submitted successfully." }),
    };
  });
