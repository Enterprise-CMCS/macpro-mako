import { Request } from "@middy/core";
import { createError } from "@middy/util";
import { getPackageChangelog } from "libs/api/package";
import { changelog } from "shared-types/opensearch";

import { getPackage, setPackage } from "./utils";

const defaults = {
  setToContext: false,
};

export const fetchChangelog = (opts: { setToContext?: boolean } = {}) => {
  const options = { ...defaults, ...opts };

  return {
    before: async (request: Request) => {
      const packageResult = await getPackage(request);

      if (!packageResult?._id) {
        throw createError(500, JSON.stringify({ message: "Internal server error" }), {
          expose: true,
        });
      }

      const filter = [];
      // @ts-ignore legacy field
      const { legacySubmissionTimestamp } = packageResult._source;
      if (legacySubmissionTimestamp !== null && legacySubmissionTimestamp !== undefined) {
        filter.push({
          range: {
            timestamp: {
              gte: new Date(legacySubmissionTimestamp).getTime(),
            },
          },
        });
      }

      const changelog = await getPackageChangelog(packageResult._id, filter);

      setPackage(
        {
          ...packageResult,
          _source: {
            ...packageResult._source,
            changelog: changelog.hits.hits as changelog.ItemResult[],
          },
        },
        request,
        options.setToContext,
      );
    },
  };
};
