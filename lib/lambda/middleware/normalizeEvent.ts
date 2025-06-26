import { Request } from "@middy/core";
import { createError } from "@middy/util";

export const normalizeEvent = () => {
  const normalizeEventBefore = async (request: Request) => {
    if (!request?.event?.body) {
      // check that the event has a body
      throw createError(400, "Event body required");
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
  };

  return {
    before: normalizeEventBefore,
  };
};
