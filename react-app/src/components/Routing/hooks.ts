import {
  NavigateOptions,
  useNavigate as useNav,
  redirect as redir,
} from "react-router-dom";
import { Route, Params } from "./types";
import { urlEmbedHash, urlEmbedParams, urlEmbedQuery } from "./utils";

export const useNavigate = () => {
  const nav = useNav();

  const navigate = <T extends Route>(
    props: {
      path: T;
      query?: Record<string, string>;
      hash?: string;
    } & Params<T>,
    options?: NavigateOptions,
  ) => {
    const to = (() => {
      let url: string = props.path;
      if (props.params) url = urlEmbedParams(url, props.params);
      if (props.query) url = urlEmbedQuery(url, props.query);
      if (props.hash) url = urlEmbedHash(url, props.hash);

      return url;
    })();

    nav(to, options);
  };

  return navigate;
};

export const redirect = <T extends Route>(
  props: {
    path: T;
    query?: Record<string, string>;
    hash?: string;
  } & Params<T>,
) => {
  const to = (() => {
    let url: string = props.path;
    if (props.params) url = urlEmbedParams(url, props.params);
    if (props.query) url = urlEmbedQuery(url, props.query);
    if (props.hash) url = urlEmbedHash(url, props.hash);

    return url;
  })();

  return redir(to);
};
