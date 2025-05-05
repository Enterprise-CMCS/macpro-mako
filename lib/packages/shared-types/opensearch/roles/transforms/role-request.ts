import { baseUserRoleRequestSchema } from "../../../events/legacy-user";

export const transform = () => {
  return baseUserRoleRequestSchema.transform((data) => ({
    id: `${data.email}_${data.territory}_${data.role}`,
    eventType: data.eventType,
    email: data.email,
    doneByEmail: data.doneByEmail,
    doneByName: data.doneByName,
    status: data.status,
    role: data.role,
    territory: data.territory,
    lastModifiedDate: data.date,
    group: data.group,
    division: data.division,
  }));
};

export type Schema = ReturnType<typeof transform>;
