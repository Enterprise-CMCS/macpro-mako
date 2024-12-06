import type { UserData, opensearch } from "shared-types";

// code borrowed from https://stackoverflow.com/questions/47914536/use-partial-in-nested-property-with-typescript
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type TestUserData = DeepPartial<UserData>;

export type TestItemResult = DeepPartial<opensearch.main.ItemResult>;

export type TestCounty = [string, string, string];
