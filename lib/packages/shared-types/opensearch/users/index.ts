import { z } from "zod";

import { UserRole } from "../../events/legacy-user";
import { onemacLegacyUserInformation, userInformation } from "./transforms/index";

export type UserDocument =
  | z.infer<onemacLegacyUserInformation.Schema>
  | z.infer<userInformation.Schema>;

export type UserResult = {
  _id: string;
  found: boolean;
  _source: UserDocument & {
    role: UserRole;
  };
};

export * from "./transforms/index";
