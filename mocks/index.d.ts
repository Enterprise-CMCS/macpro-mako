import type { Common, Search_RequestBody, TermQuery } from "@opensearch-project/opensearch";
import type { APIGatewayEventRequestContext, UserData, opensearch } from "shared-types";

import type { Export } from "@aws-sdk/client-cloudformation";
import type { GetSecretValueCommandOutput } from "@aws-sdk/client-secrets-manager";

// code borrowed from https://stackoverflow.com/questions/47914536/use-partial-in-nested-property-with-typescript
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type TestUserData = DeepPartial<UserData>;

export type TestItemResult = DeepPartial<opensearch.main.ItemResult>;

export type TestMainDocument = TestItemResult["_source"];

export type TestAppkItemResult = Omit<TestItemResult, "found">;

export type TestAppkDocument = TestAppkItemResult["_source"];

export type TestChangelogItemResult = DeepPartial<opensearch.changelog.ItemResult>;

export type TestChangelogDocument = TestChangelogItemResult["_source"];

export type TestSecretData = Partial<Omit<GetSecretValueCommandOutput, "CreatedDate">> & {
  CreatedDate: number;
  DeletedDate?: number;
};

export type TestExport = Partial<Export>;

export type IdpRequestSessionBody = {
  AccessToken: string;
};

export type IdpRefreshRequestBody = {
  ClientId: string;
  AuthFlow: "REFRESH_TOKEN_AUTH";
  AuthParameters: {
    REFRESH_TOKEN: string;
    DEVICE_KEY: null;
  };
};

export type IdpListUsersRequestBody = {
  UserPoolId: string;
  Filter: string;
};

export type SecretManagerRequestBody = {
  SecretId: string;
};

export type GetItemBody = { id: string };

export type SearchQueryBody = Search_RequestBody;

export type SearchTerm = Record<string, TermQuery | Common.FieldValue>;

export type EventRequestContext = Partial<APIGatewayEventRequestContext>;

export type TestCounty = [string, string, string];
