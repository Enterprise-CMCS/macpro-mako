import { z } from "zod";

import { onemacLegacyUserRoleRequest, Territory, userRoleRequest } from "../../events/legacy-user";
import { AggQuery, Filterable as FIL, Hit, QueryState, Response as Res } from "./../_";

export type Document =
  | z.infer<typeof userRoleRequest>
  | z.infer<typeof onemacLegacyUserRoleRequest>;

export type Response = Res<Document>;
export type ItemResult = Hit<Document> & {
  found: boolean;
};

export type Field = keyof Document | `${keyof Document}.keyword`;
export type Filterable = FIL<Field>;
export type State = QueryState<Field>;
export type Aggs = AggQuery<Field>;

export type RoleApprover = { email: string; fullName: string; territory: Territory };
export type RoleRequestRaw = {
  role: string;
  statusCode?: number;
  territory: Territory[];
  approvers: RoleApprover[];
};
export type RoleRequest = Document & {
  approverList?: RoleApprover[];
};
