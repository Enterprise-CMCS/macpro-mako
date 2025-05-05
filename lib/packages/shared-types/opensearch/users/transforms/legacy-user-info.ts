import { z } from "zod";

import { baseUserInformationSchema, userInfoEvent } from "../../../events/legacy-user";

export const transform = () => {
  return baseUserInformationSchema
    .extend({
      pk: z.string().email(),
      sk: z.literal("ContactInfo"),
      eventType: userInfoEvent.default("legacy-user-info"),
    })
    .transform((data) => ({
      id: data.pk,
      eventType: data.eventType,
      email: data.pk,
      group: data.group,
      division: data.division,
      fullName: data.fullName,
    }));
};

export type Schema = ReturnType<typeof transform>;
