import { MiddlewareObj, Request } from "@middy/core";
import { createError } from "@middy/util";
import { getAppkChildren } from "libs/api/package";

import { getPackageFromRequest, storePackageInRequest } from "./utils";

export type FetchAppkChildrenOptions = { setToContext?: boolean };

const defaults: FetchAppkChildrenOptions = {
  setToContext: false,
};

/**
 * Fetches any Appk children of the package and adds them to the package in internal storage.
 * @param {object} opts Options for running the middleware
 * @param {boolean} opts.setToContext [false] if true, also stores the package in context, so it can be accessed in the handler
 * @returns {MiddlewareObj} middleware to fetch the Appk children before the handler runs
 */
export const fetchAppkChildren = (opts: FetchAppkChildrenOptions = {}): MiddlewareObj => {
  const options = { ...defaults, ...opts };

  return {
    before: async (request: Request) => {
      const packageResult = await getPackageFromRequest(request);

      if (packageResult?._id) {
        // @ts-ignore appkParent is a legacy field
        if (packageResult?._source?.appkParent) {
          let children;
          try {
            children = await getAppkChildren(packageResult._id);
          } catch (err) {
            console.error(err);
            throw createError(500, JSON.stringify({ message: "Internal server error" }), {
              expose: true,
            });
          }

          if (children?.hits?.hits?.length > 0) {
            storePackageInRequest(
              {
                ...packageResult,
                _source: {
                  ...packageResult._source,
                  appkChildren: children.hits.hits,
                },
              },
              request,
              options.setToContext,
            );
          }
        }
      }
    },
  };
};
