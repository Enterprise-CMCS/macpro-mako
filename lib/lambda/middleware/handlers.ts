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

export type BaseMiddyOptions = NormalizeEventOptions & {
  eventSchema?: z.ZodTypeAny;
};

const defaults: BaseMiddyOptions = {
  eventSchema: undefined,
};

export const baseMiddy = (opts: BaseMiddyOptions = {}) => {
  const options = { ...defaults, ...opts };

  const { eventSchema, ...normalizeEventOptions } = options;

  let handler = middy()
    .use(
      httpErrorHandler({ fallbackMessage: JSON.stringify({ message: "Internal server error" }) }),
    )
    .use(normalizeEvent(normalizeEventOptions))
    .use(httpJsonBodyParser());

  if (eventSchema) {
    handler = handler.use(zodValidator({ eventSchema }));
  }

  return handler;
};

export type AuthedMiddyOptions = NormalizeEventOptions &
  IsAuthenticatedOptions & {
    eventSchema?: z.ZodTypeAny;
  };

export const authedMiddy = (opts: AuthedMiddyOptions = {}) => {
  const options = { ...defaults, ...opts };

  const { setToContext, ...baseMiddyOptions } = options;

  return baseMiddy(baseMiddyOptions).use(isAuthenticated({ setToContext }));
};
