import type { Export } from "@aws-sdk/client-cloudformation";
import { CreateEventSourceMappingCommandInput } from "@aws-sdk/client-lambda";
import type { GetSecretValueCommandOutput } from "@aws-sdk/client-secrets-manager";
import type { APIGatewayEventRequestContext, UserData, opensearch } from "shared-types";

// code borrowed from https://stackoverflow.com/questions/47914536/use-partial-in-nested-property-with-typescript
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type TestHit<T> = DeepPartial<opensearch.Hit<T>>;

export type TestUserData = DeepPartial<UserData>;

export type TestItemResult = DeepPartial<opensearch.main.ItemResult>;

export type TestMainDocument = TestItemResult["_source"];

export type TestAppkItemResult = Omit<TestItemResult, "found">;

export type TestAppkDocument = TestAppkItemResult["_source"];

export type TestChangelogItemResult = DeepPartial<opensearch.changelog.ItemResult>;

export type TestChangelogDocument = TestChangelogItemResult["_source"];

export type TestTypeItemResult = DeepPartial<opensearch.types.ItemResult>;

export type TestTypeDocument = TestTypeItemResult["_source"];

export type TestSubtypeItemResult = DeepPartial<opensearch.subtypes.ItemResult>;

export type TestSubtypeDocument = TestSubtypeItemResult["_source"];

export type TestSecretData = Partial<Omit<GetSecretValueCommandOutput, "CreatedDate">> & {
  CreatedDate: number;
  DeletedDate?: number;
};

export type TestExport = Partial<Export>;

export type IdentityRequest = {
  IdentityPoolId: string;
  Logins: Record<string, string>;
};

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

export type AdminGetUserRequestBody = {
  UserPoolId: string;
  Username: string;
};

export type SecretManagerRequestBody = {
  SecretId: string;
};

type FieldValue = boolean | undefined | number | string;
type MinimumShouldMatch = number | string;
type TermsLookup = {
  id?: string;
  index?: string;
  path?: string;
  routing?: string;
};
type TermsQueryField = FieldValue[] | TermsLookup;
type QueryBase = {
  _name?: string;
  boost?: number;
};
type MatchQuery =
  | FieldValue
  | (QueryBase & {
      analyzer?: string;
      auto_generate_synonyms_phrase_query?: boolean;
      cutoff_frequency?: number;
      query: FieldValue;
    });
type MatchAllQuery = QueryBase & Record<string, any>;
export type TermQuery =
  | FieldValue
  | (QueryBase & {
      case_insensitive?: boolean;
      value: FieldValue;
    });
export type TermsQuery = QueryBase & {
  _name?: any;
  boost?: any;
  [key: string]: any | TermsQueryField;
};
type QueryContainer = {
  match?: Record<string, MatchQuery>;
  match_all?: MatchAllQuery;
  term?: Record<string, TermQuery>;
  terms?: TermsQuery;
};
type BoolQuery = QueryBase & {
  adjust_pure_negative?: boolean;
  filter?: QueryContainer | QueryContainer[];
  minimum_should_match?: MinimumShouldMatch;
  must?: QueryContainer | QueryContainer[];
  must_not?: QueryContainer | QueryContainer[];
  should?: QueryContainer | QueryContainer[];
};

export type SearchQueryBody = {
  from?: number;
  search?: string;
  query?: {
    bool: BoolQuery;
    match_all?: MatchAllQuery;
  };
  size?: number;
  sortDirection?: string;
  sortField?: string;
};

export type GetItemBody = { id: string };

export type EventRequestContext = Partial<APIGatewayEventRequestContext>;

export type TestEventSourceMapping = {
  Topics: [string];
  SelfManagedKafkaEventSourceConfig?: {
    ConsumerGroupId?: string;
  } | null;
  State?: "Creating" | "Enabling" | "Enabled" | "Disabling" | "Disabled" | "Updating" | "Deleting";
  UUID?: string;
};

export type TestEventSourceMappingRequestBody = DeepPartial<CreateEventSourceMappingCommandInput>;

export type TestStepFunctionRequestBody = {
  stateMachineArn: string;
  input: string;
};

export type TestCounty = [string, string, string];
