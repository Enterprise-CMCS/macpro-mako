import { Request } from "@middy/core";
import { createError } from "@middy/util";
import { validateEnvVariable } from "shared-utils";

const defaults = {
  opensearch: false,
  disableCors: false,
};

export const normalizeEvent = (opts: { opensearch?: boolean; disableCors?: boolean } = {}) => {
  const options = { ...defaults, ...opts };

  return {
    before: async (request: Request) => {
      if (options.opensearch) {
        try {
          validateEnvVariable("osDomain");
          validateEnvVariable("indexNamespace");
        } catch (err) {
          console.error(err);
          // if you don't use the expose option here, you won't be able to see the error message
          throw createError(500, JSON.stringify({ message: "Internal server error" }), {
            expose: true,
          });
        }
      }

      if (!request?.event?.body) {
        // check that the event has a body
        throw createError(400, JSON.stringify({ message: "Event body required" }));
      }

      if (
        !request?.event?.headers ||
        (!request.event.headers["Content-Type"] && !request.event.headers["content-type"])
      ) {
        // if the headers don't have the Content-Type set, set it
        request.event.headers = {
          ...request.event.headers,
          "Content-Type": "application/json",
        };
      }
    },
    after: async (request: Request) => {
      if (!options.disableCors) {
        request.response.headers = {
          ...request.response.headers,
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
        };
      }
    },
  };
};
