import { z } from "zod";

import { baseUserRoleRequestSchema, roleEvent, skPattern } from "../../../events/legacy-user";

export const transform = () => {
  return baseUserRoleRequestSchema
    .extend({
      pk: z.string().email(),
      sk: z.string().regex(skPattern),
      eventType: roleEvent.default("legacy-user-role"),
    })
    .transform((data) => ({
      id: `${data.pk}_${data.territory}_${data.role}`,
      eventType: data.eventType,
      email: data.pk,
      doneByEmail: data.doneByEmail,
      doneByName: data.doneByName,
      status: data.status,
      role: data.role,
      territory: data.territory,
      lastModifiedDate: data.date,
    }));
};

export type Schema = ReturnType<typeof transform>;
export function safeParse(arg0: {
  eventType: string;
  componentType: keyof typeof import("../../main").legacyTransforms;
}) {
  throw new Error("Function not implemented.");
}
