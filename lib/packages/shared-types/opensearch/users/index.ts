import { z } from "zod";

import { onemacLegacyUserInformation, userInformation, UserRole } from "../../events/legacy-user";
import { AggQuery, Filterable as FIL, Hit, QueryState, Response as Res } from "./../_";

export type Document = (
  | z.infer<typeof onemacLegacyUserInformation>
  | z.infer<typeof userInformation>
) & { role: UserRole; states?: string[] };

export type Response = Res<Document>;
export type ItemResult = Hit<Document> & {
  found: boolean;
};

export type Field = keyof Document | `${keyof Document}.keyword`;
export type Filterable = FIL<Field>;
export type State = QueryState<Field>;
export type Aggs = AggQuery<Field>;
