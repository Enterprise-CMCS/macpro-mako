import { z } from "zod";

import { onemacLegacyUserRoleRequest, userRoleRequest } from "./transforms/index";

export type RoleDocument =
  | z.infer<userRoleRequest.Schema>
  | z.infer<onemacLegacyUserRoleRequest.Schema>;

export type RoleResult = {
  _id: string;
  found: boolean;
  _source: RoleDocument;
};

export * from "./transforms/index";
