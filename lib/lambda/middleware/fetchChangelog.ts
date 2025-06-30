import { Request } from "@middy/core";
import { createError, getInternal } from "@middy/util";
import { getPackageChangelog } from "libs/api/package";
import { changelog, main } from "shared-types/opensearch";

const defaults = {
  setToContext: false,
};

export const fetchChangelog = (opts: { setToContext?: boolean } = {}) => {
  const options = { ...defaults, ...opts };

  return {
    before: async (request: Request) => {
      const { packageResult } = (await getInternal("packageResult", request)) as {
        packageResult: main.ItemResult;
      };

      if (!packageResult?._id) {
        throw createError(500, JSON.stringify({ message: "Internal server error" }));
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

      const updatedPackage: main.ItemResult = {
        ...packageResult,
        _source: {
          ...packageResult._source,
          changelog: changelog.hits.hits as changelog.ItemResult[],
        },
      };

      Object.assign(request.internal, { packageResult: updatedPackage });

      if (options.setToContext) {
        Object.assign(request.context, { packageResult: updatedPackage });
      }
    },
  };
};
