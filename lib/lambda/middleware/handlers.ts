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

export const authenticatedMiddy = (opts: AuthenticatedMiddyOptions = {}) => {
  const options = { ...defaults, ...opts };

  const { setToContext, ...baseMiddyOptions } = options;

  return nonAuthenticatedMiddy(baseMiddyOptions).use(isAuthenticated({ setToContext }));
};
