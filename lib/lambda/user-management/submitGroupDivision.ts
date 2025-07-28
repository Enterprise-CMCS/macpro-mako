import { APIGatewayEvent } from "aws-lambda";
import { produceMessage } from "libs/api/kafka";
import { z } from "zod";

import { authenticatedMiddy, canViewUser, ContextWithAuthenticatedUser } from "../middleware";
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

export const handler = authenticatedMiddy({
  opensearch: true,
  kafka: true,
  setToContext: true,
  eventSchema: submitGroupDivisionEventSchema,
})
  .use(canViewUser())
  .handler(async (event: SubmitGroupDivisionEvent, context: ContextWithAuthenticatedUser) => {
    const { authenticatedUser } = context;
    const { userEmail, group, division } = event.body;
    const email = userEmail || authenticatedUser?.email;

    if (!email) {
      throw new Error("Email is undefined");
    }

    const userInfo = await getUserByEmail(email);

    if (!userInfo) {
      throw new Error("User is undefined");
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
      body: { message: "Group and division submitted successfully." },
    };
  });
