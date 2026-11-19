import { type APIGatewayEvent } from "aws-lambda";
import { itemExists } from "libs/api/package";
import { events } from "shared-types/events";

import { authorizeCeSubmitter } from "./authorize-ce-submitter";

export const ceRecordSubmitted = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return;
  }

  const parsedResult = events["ce-record-submitted"].baseSchema.safeParse(JSON.parse(event.body));
  if (!parsedResult.success) {
    throw parsedResult.error;
  }

  const user = await authorizeCeSubmitter(event, parsedResult.data.id, parsedResult.data.state);

  if (await itemExists({ id: parsedResult.data.id })) {
    throw "Item Already Exists";
  }

  return events["ce-record-submitted"].schema.parse({
    ...parsedResult.data,
    submitterName: user.fullName,
    submitterEmail: user.email,
    timestamp: Date.now(),
  });
};
