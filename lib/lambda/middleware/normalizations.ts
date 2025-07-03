import { MiddlewareObj, Request } from "@middy/core";
import { createError } from "@middy/util";
import { validateEnvVariable } from "shared-utils";

export type NormalizeEventOptions = {
  opensearch?: boolean;
  kafka?: boolean;
  disableCors?: boolean;
};

const defaults: NormalizeEventOptions = {
  opensearch: false,
  kafka: false,
  disableCors: false,
};

/**
 * Normalizes the input and output of the handler.
 *
 * *Before handler*: performs normalizations and validations on the event, including:
 * - (optionally) validates that the opensearch environment variables are set, if the opensearch option is true
 * - validates that the event has a body
 * - adds `"Content-Type": "application/json"` to the headers, if it is missing, this is required to use the `httpJsonBodyParser` middleware
 *
 * *After handler*: adds the CORS headers to the response, unless the disableCors option is true
 * @param {object} opts Options for running the middleware
 * @param {boolean} opts.opensearch [false] if true, validate opensearch environment variables
 * @param {boolean} opts.kafka [false] if true, validate kafka topic name environment variable
 * @param {boolean} opts.disableCors [false] if true, disable the CORS headers on the response
 * @returns {MiddlewareObj} middleware with the input and output normalizations
 */
export const normalizeEvent = (opts: NormalizeEventOptions = {}): MiddlewareObj => {
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

      if (options.kafka) {
        try {
          validateEnvVariable("topicName");
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
        !Object.keys(request.event.headers)
          .map((header) => header.toLowerCase())
          .includes("content-type")
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
