import type { UrlObject } from "url";

export type RoutesModule = typeof import("./routes");

export type Route = RoutesModule[keyof RoutesModule];

export type StringWithBrackets<T extends string> =
  T extends `${infer _V}:${infer U}` ? U : never;

export type HasSquareBrackets<T extends string> =
  StringWithBrackets<T> extends never ? false : true;

export type QueryInterface<T extends Route> = HasSquareBrackets<T> extends true
  ? {
      query:
        | Record<string, string | string[]>
        | Record<StringWithBrackets<T>, string | number>;
    }
  : // eslint-disable-next-line @typescript-eslint/ban-types
    {};

export type URL<T extends Route> =
  | (Omit<UrlObject, "pathname" | "query"> & {
      pathname: T;
    } & QueryInterface<T>)
  | Exclude<Route, `${string}:${string}`>;

export type TupleByCharKeyToInterface<
  T extends string[],
  C extends string
> = Omit<
  {
    [P in {
      [K in keyof T]: T[K] extends `${C}${infer _S}` ? _S : never;
    }[keyof T]]: any;
  },
  number
>;

export type StringToTuple<T extends string, D extends string> = T extends string
  ? T extends `${infer S}${D}${infer B}`
    ? [S, ...StringToTuple<B, D>]
    : [T]
  : never;

type StringContains<
  T extends string,
  C extends string
> = T extends `${infer _U}${C}${infer _A}` ? true : false;

export type Params<
  T extends string,
  TDelimiter extends string = "/",
  TWildCard extends string = ":"
> = StringContains<T, TWildCard> extends true
  ? {
      params: TupleByCharKeyToInterface<
        StringToTuple<T, TDelimiter>,
        TWildCard
      >;
    }
  : // eslint-disable-next-line @typescript-eslint/ban-types
    {};
