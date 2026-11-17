import { type APIGatewayEvent } from "aws-lambda";
import { itemExists } from "libs/api/package";
import { events } from "shared-types/events";

import { authorizeCeSubmitter } from "./authorize-ce-submitter";

export const ceSubsequentDocuments = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return;
  }

  const parsedResult = events["ce-subsequent-documents"].baseSchema.safeParse(
    JSON.parse(event.body),
  );
  if (!parsedResult.success) {
    throw parsedResult.error;
  }

  const user = await authorizeCeSubmitter(event, parsedResult.data.id, parsedResult.data.state);

  if ((await itemExists({ id: parsedResult.data.id })) === false) {
    throw "Item Doesn't Exist";
  }

  return events["ce-subsequent-documents"].schema.parse({
    ...parsedResult.data,
    submitterName: user.fullName,
    submitterEmail: user.email,
    timestamp: Date.now(),
  });
};
