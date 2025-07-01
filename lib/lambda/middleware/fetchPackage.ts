import { MiddlewareObj, Request } from "@middy/core";
import { createError } from "@middy/util";
import { getPackage } from "libs/api/package";

import { setPackage } from "./utils";

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
 * @param {boolean} opts.setToContext [false] if true, also store the fetched data in the context so the data can be accessed in the handler
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
        console.error(err);
        if (!options.allowNotFound) {
          // if you don't use the expose option here, you won't be able to see the error message
          throw createError(500, JSON.stringify({ message: "Internal server error" }), {
            expose: true,
          });
        }
      }

      if (!options.allowNotFound && (packageResult === undefined || !packageResult.found)) {
        throw createError(404, JSON.stringify({ message: "No record found for the given id" }));
      }

      setPackage(packageResult, request, options.setToContext);
    },
  };
};
