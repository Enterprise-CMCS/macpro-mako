import { MiddlewareObj, Request } from "@middy/core";
import { createError } from "@middy/util";
import { validateEnvVariable } from "shared-utils";

export type NormalizeEventOptions = {
  opensearch?: boolean;
  kafka?: boolean;
  body?: boolean;
  disableCors?: boolean;
};

const defaults: NormalizeEventOptions = {
  opensearch: false,
  kafka: false,
  body: true,
  disableCors: false,
};

/**
 * Normalizes the input and output of the handler.
 *
 * *Before handler*: performs normalizations and validations on the event, including:
 * - (optionally) validates that the opensearch environment variables are set, if the opensearch option is true
 * - (optionally) validates that the kafka environment variables are set, if the kafka option is true
 * - validates that the event has a body, unless the body option is false
 * - adds `"Content-Type": "application/json"` to the headers, if it is missing, this is required to use the `httpJsonBodyParser` middleware
 *
 *
 * *After handler*: adds the CORS headers to the response, unless the disableCors option is true
 *
 *
 * @param {object} opts Options for running the middleware
 * @param {boolean} opts.opensearch [false] if true, validate opensearch environment variables
 * @param {boolean} opts.kafka [false] if true, validate kafka topic name environment variable
 * @param {boolean} opts.body [true] if false, skips validating the event body
 * @param {boolean} opts.disableCors [false] if true, disable the CORS headers on the response
 * @returns {MiddlewareObj} middleware with the input and output normalizations
 */
export const normalizeEvent = (opts: NormalizeEventOptions = {}): MiddlewareObj => {
  const options = { ...defaults, ...opts };

  return {
    before: async (request: Request) => {
      console.log(JSON.stringify(request?.event, null, 2));
      if (options.opensearch) {
        validateEnvVariable("osDomain");
        validateEnvVariable("indexNamespace");
      }

      if (options.kafka) {
        validateEnvVariable("topicName");
      }

      if (
        options.body &&
        request?.event?.httpMethod !== "GET" &&
        request?.event?.httpMethod !== "HEAD"
      ) {
        if (!request?.event?.body) {
          // check that the event has a body
          throw createError(400, JSON.stringify({ message: "Event body required" }));
        }
        if (typeof request.event.body === "object") {
          request.event.body = JSON.stringify(request.event.body);
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
      }
    },
    after: async (request: Request) => {
      if (typeof request.response.body === "object") {
        request.response.body = JSON.stringify(request.response.body);
      }

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
