import { Request } from "@middy/core";
import { createError } from "@middy/util";
import { getPackage } from "libs/api/package";

import { setPackage } from "./utils";

const defaults = {
  allowNotFound: false,
  setToContext: false,
};

export const fetchPackage = (opts: { allowNotFound?: boolean; setToContext?: boolean } = {}) => {
  const options = { ...defaults, ...opts };

  return {
    before: async (request: Request) => {
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
