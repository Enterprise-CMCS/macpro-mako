/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  NavigateOptions,
  useNavigate as useNav,
  useParams as usePara,
} from "react-router-dom";
import {
  Route,
  Params,
  TupleByCharKeyToInterface,
  StringToTuple,
} from "./types";
import { urlEmbedHash, urlEmbedParams, urlEmbedQuery } from "./utils";

export const useNavigate = () => {
  const nav = useNav();

  const navigate = <T extends Route>(
    props: {
      path: T;
      query?: Record<string, string>;
      hash?: string;
    } & Params<T>,
    options?: NavigateOptions
  ) => {
    const to = (() => {
      let url: string = props.path;
      //@ts-ignore
      if (props.params) url = urlEmbedParams(url, props.params);
      if (props.query) url = urlEmbedQuery(url, props.query);
      if (props.hash) url = urlEmbedHash(url, props.hash);

      return url;
    })();

    nav(to, options);
  };

  return navigate;
};

export const useParams = <T extends Route>(_: T) => {
  //@ts-ignore
  return usePara<TupleByCharKeyToInterface<StringToTuple<T, "/">, ":">>();
};
