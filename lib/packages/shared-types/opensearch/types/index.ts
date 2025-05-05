import { z } from "zod";

import {
  onemacLegacyUserRoleRequest,
  userInformation,
  UserRole,
  userRoleRequest,
} from "../../events/legacy-user";
import { AggQuery, Filterable as FIL, Hit, QueryState, Response as Res } from "./../_";
import { SPA_Type } from "./transforms";

export type Document = z.infer<SPA_Type.Schema>;
export type UserDocument = z.infer<typeof userInformation>;
export type RoleDocument =
  | z.infer<typeof userRoleRequest>
  | z.infer<typeof onemacLegacyUserRoleRequest>;

export type Response = Res<Document>;
export type ItemResult = Hit<Document> & {
  found: boolean;
};
export type UserResult = {
  _id: string;
  found: boolean;
  _source: UserDocument & {
    role: UserRole;
  };
};

export type RoleResult = {
  _id: string;
  found: boolean;
  _source: RoleDocument;
};

export type Field = keyof Document | `${keyof Document}.keyword`;
export type Filterable = FIL<Field>;
export type State = QueryState<Field>;
export type Aggs = AggQuery<Field>;

export * from "./transforms";
