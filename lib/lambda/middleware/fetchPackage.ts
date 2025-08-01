import { MiddlewareObj, Request } from "@middy/core";
import { createError } from "@middy/util";
import { getPackage } from "libs/api/package";

import { storePackageInRequest } from "./utils";

export type FetchPackageOptions = {
  allowNotFound?: boolean;
  setToContext?: boolean;
};

const defaults: FetchPackageOptions = {
  allowNotFound: false,
  setToContext: false,
};

/**
 * Fetches a package and adds it to internal storage.
 * @param {object} opts Options for running the middleware
 * @param {boolean} opts.allowNotFound [false] if true, do not error if the package is not found
 * @param {boolean} opts.setToContext [false] if true, also stores the package in context, so it can be accessed in the handler
 * @returns {MiddlewareObj} middleware to fetch a package before the handler runs
 */
export const fetchPackage = (opts: FetchPackageOptions = {}): MiddlewareObj => {
  const options = { ...defaults, ...opts };

  return {
    before: async (request: Request) => {
      // the event body should already have been validated by `validator` before this handler runs
      const { id } = request.event.body as { id: string };

      let packageResult;
      try {
        packageResult = await getPackage(id);
      } catch (err) {
        if (!options.allowNotFound) {
          throw err;
        }
      }

      if (!options.allowNotFound && (packageResult === undefined || !packageResult.found)) {
        throw createError(404, JSON.stringify({ message: "No record found for the given id" }));
      }

      storePackageInRequest(packageResult, request, options.setToContext);
    },
  };
};
