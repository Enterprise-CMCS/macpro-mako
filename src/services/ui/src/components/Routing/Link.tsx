/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Link as AppLink,
  Navigate as AppNavigate,
  NavigateProps,
  LinkProps,
} from "react-router-dom";
import { Params, Route } from "./types";
import { urlEmbedHash, urlEmbedParams, urlEmbedQuery } from "./utils";

export type _LinkProps<T extends Route> = {
  path: T;
  hash?: string;
  query?: Record<string, string>;
} & Params<T> &
  Omit<LinkProps, "to">;

export const Link = <T extends Route>(props: _LinkProps<T>) => {
  //@ts-ignore
  const { path, params, hash, query, ...rest } = props;

  const to = (() => {
    let url: string = path;
    //@ts-ignore
    if (params) url = urlEmbedParams(url, params);
    if (query) url = urlEmbedQuery(url, query);
    if (hash) url = urlEmbedHash(url, hash);
    return url;
  })();

  return <AppLink to={to} {...rest} />;
};

export type _NavigateProps<T extends Route> = {
  path: T;
  hash?: string;
  query?: Record<string, string>;
} & Params<T> &
  Omit<NavigateProps, "to">;

export const Navigate = <T extends Route>(props: _NavigateProps<T>) => {
  //@ts-ignore
  const { path, params, hash, query, ...rest } = props;

  const to = (() => {
    let url: string = path;
    //@ts-ignore
    if (params) url = urlEmbedParams(path, params);
    if (query) url = urlEmbedQuery(path, query);
    if (hash) url = urlEmbedHash(path, hash);
    return url;
  })();

  return <AppNavigate to={to} {...rest} />;
};
