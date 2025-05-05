import { baseUserInformationSchema } from "../../../events/legacy-user";

export const transform = () => {
  return baseUserInformationSchema.transform((data) => ({
    id: data.email,
    eventType: data.eventType,
    email: data.email,
    group: data.group,
    division: data.division,
    fullName: data.fullName,
  }));
};

export type Schema = ReturnType<typeof transform>;
