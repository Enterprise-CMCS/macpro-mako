import { zodValidator } from "@dannywrayuk/middy-zod-validator";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { z } from "zod";

import {
  isAuthenticated,
  IsAuthenticatedOptions,
  normalizeEvent,
  NormalizeEventOptions,
} from "./index";

export type NonAuthenticatedMiddyOptions = NormalizeEventOptions & {
  eventSchema?: z.ZodTypeAny;
};

const defaults: NonAuthenticatedMiddyOptions = {
  eventSchema: undefined,
  body: true,
};

/**
 * Base Middy handler for non-authenticated endpoints. Sets up the error handler. Runs the event normalization.
 * If applicable, it parses the event body and validates it against the schema.
 * @param {object} opts Options for the Middy handler
 * @param {boolean} opts.opensearch [false] if true, validate opensearch environment variables
 * @param {boolean} opts.kafka [false] if true, validate kafka topic name environment variable
 * @param {boolean} opts.disableCors [false] if true, disable the CORS headers on the response
 * @param {boolean} opts.body [true] if false, skips validating the event body in normalization and schema
 * @param {z.ZodTypeAny} options.eventSchema [undefined] if not undefined, validates the event body using the schema
 * @returns {middy.MiddyfiedHandler<unknown, any, Error, Context, {}>} base Middy handler
 */
export const nonAuthenticatedMiddy = (opts: NonAuthenticatedMiddyOptions = {}) => {
  const options = { ...defaults, ...opts };

  const { eventSchema, ...normalizeEventOptions } = options;

  let handler = middy()
    .use(
      httpErrorHandler({ fallbackMessage: JSON.stringify({ message: "Internal server error" }) }),
    )
    .use(normalizeEvent(normalizeEventOptions));
  if (options.body) {
    handler = handler.use(httpJsonBodyParser({ disableContentTypeError: true }));

    if (eventSchema) {
      handler = handler.use(zodValidator({ eventSchema }));
    }
  }

  return handler;
};

export type AuthenticatedMiddyOptions = NormalizeEventOptions &
  IsAuthenticatedOptions & {
    eventSchema?: z.ZodTypeAny;
  };

/**
 * Base Middy handler for authenticated endpoints. Sets up the error handler. Runs the event normalization.
 * If applicable, it parses the event body and validates it against the schema. Authenticates the current user.
 * @param {object} opts Options for the Middy handler
 * @param {boolean} opts.opensearch [false] if true, validate opensearch environment variables
 * @param {boolean} opts.kafka [false] if true, validate kafka topic name environment variable
 * @param {boolean} opts.disableCors [false] if true, disable the CORS headers on the response
 * @param {boolean} opts.body [true] if false, skips validating the event body in normalization and schema
 * @param {z.ZodTypeAny} options.eventSchema [undefined] if not undefined, validates the event body using the schema
 * @param {boolean} opts.setToContext [false] if true, also stores the package in context, so it can be accessed in the handler
 * @returns {middy.MiddyfiedHandler<unknown, any, Error, Context, {}>} base Middy handler
 */
export const authenticatedMiddy = (opts: AuthenticatedMiddyOptions = {}) => {
  const options = { ...defaults, ...opts };

  const { setToContext, ...baseMiddyOptions } = options;

  return nonAuthenticatedMiddy(baseMiddyOptions).use(isAuthenticated({ setToContext }));
};
