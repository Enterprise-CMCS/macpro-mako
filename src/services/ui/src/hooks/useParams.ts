import LZ from "lz-string";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * useLzQuery syncs a url query parameter with a given state.
 * LZ is a library which can compresses JSON into a uri string
 * and can decompresses JSON strings into state objects
 */
export const useParams = <T>(props: { key: string; initValue?: T }) => {
  const [params, setParams] = useSearchParams();

  const queryString = params.get(props.key) || "";

  const state: T = useMemo(() => {
    if (!queryString) return props.initValue;

    const decompress = LZ.decompressFromEncodedURIComponent(queryString);
    if (!decompress) return props.initValue;

    try {
      return JSON.parse(decompress);
    } catch (e) {
      return props.initValue;
    }
  }, [queryString]);

  const onSet = (arg: (arg: T) => T | T, shouldIsolate?: boolean) => {
    const val = (() => {
      if (typeof arg !== "function") return arg;
      return arg(state);
    })();

    const compressedValue = LZ.compressToEncodedURIComponent(
      JSON.stringify(val)
    );

    setParams((s) => {
      const prevParams = (() => {
        if (shouldIsolate) return {};
        const nextVal = {} as Record<string, string>;
        for (const param of s.keys()) {
          nextVal[param] = s.get(param) || "";
        }
        return nextVal;
      })();

      return { ...prevParams, [props.key]: compressedValue };
    });
  };

  const onClear = () => {
    setParams((s) => {
      s.delete(props.key);
      return s;
    });
  };

  return { state, queryString, onSet, onClear };
};
