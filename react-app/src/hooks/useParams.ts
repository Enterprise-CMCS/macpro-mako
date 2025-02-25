import LZ from "lz-string";
import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { useLocalStorage } from "./useLocalStorage";

/**
 * useLzQuery syncs a url query parameter with a given state.
 * LZ is a library which can compresses JSON into a uri string
 * and can decompresses JSON strings into state objects
 */
export const useLzUrl = <T>(props: { key: string; initValue?: T; redirectTab?: string }) => {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useLocalStorage("osQuery", null);

  const queryString = params.get(props.key) || "";

  const state: T = useMemo(() => {
    if (!queryString) {
      if (query) return JSON.parse(query);
      return props.initValue;
    }

    const decompress = LZ.decompressFromEncodedURIComponent(queryString);
    if (!decompress) return props.initValue;

    try {
      setQuery(decompress);
      const parsed = JSON.parse(decompress);
      return { ...parsed, tab: props.redirectTab ?? parsed.tab };
    } catch {
      return props.initValue;
    }
    // adding props.initValue causes this to loop
  }, [queryString, query, setQuery]);

  const onSet = (arg: (arg: T) => T | T, shouldIsolate?: boolean) => {
    const val = (() => {
      if (typeof arg !== "function") return arg;
      return arg(state);
    })();

    const compressedValue = LZ.compressToEncodedURIComponent(JSON.stringify(val));

    setParams(
      (s) => {
        const prevParams = (() => {
          if (shouldIsolate) return {};
          const nextVal = {} as Record<string, string>;
          for (const param of s.keys()) {
            nextVal[param] = s.get(param) || "";
          }
          return nextVal;
        })();

        return { ...prevParams, [props.key]: compressedValue };
      },
      { replace: true },
    );
  };

  const onClear = () => {
    setParams((s) => {
      s.delete(props.key);
      return s;
    });
  };

  return { state, queryString, onSet, onClear };
};
