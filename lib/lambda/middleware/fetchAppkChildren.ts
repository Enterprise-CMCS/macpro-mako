import { MiddlewareObj, Request } from "@middy/core";
import { createError } from "@middy/util";
import { getAppkChildren } from "libs/api/package";

import { getPackage, setPackage } from "./utils";

export type FetchAppkChildrenOptions = { setToContext?: boolean };

const defaults: FetchAppkChildrenOptions = {
  setToContext: false,
};

/**
 * Fetches the Appk children for the package, if there are any, and adds them to the package in internal storage.
 * @param {object} opts Options for running the middleware
 * @param {boolean} opts.setToContext [false] if true, also store the fetched data in the context so the data can be accessed in the handler
 * @returns {MiddlewareObj} middleware to fetch the Appk children before the handler runs
 */
export const fetchAppkChildren = (opts: FetchAppkChildrenOptions = {}): MiddlewareObj => {
  const options = { ...defaults, ...opts };

  return {
    before: async (request: Request) => {
      const packageResult = await getPackage(request);

      if (!packageResult?._id) {
        throw createError(500, JSON.stringify({ message: "Internal server error" }), {
          expose: true,
        });
      }

      let appkChildren: any[] = [];
      // @ts-ignore appkParent is a legacy field
      if (packageResult?._source?.appkParent) {
        const children = await getAppkChildren(packageResult._id);
        appkChildren = children.hits.hits;
      }

      if (appkChildren.length > 0) {
        setPackage(
          {
            ...packageResult,
            _source: {
              ...packageResult._source,
              appkChildren,
            },
          },
          request,
          options.setToContext,
        );
      }
    },
  };
};
