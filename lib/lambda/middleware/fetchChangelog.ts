import { Request } from "@middy/core";
import { createError } from "@middy/util";
import { getPackageChangelog } from "libs/api/package";
import { changelog } from "shared-types/opensearch";

import { getPackage, setPackage } from "./utils";

export type FetchChangelogOptions = { setToContext?: boolean };

const defaults: FetchChangelogOptions = {
  setToContext: false,
};

/**
 * Fetches the changelog for the package, if there is any, and adds it to the package in internal storage.
 * @param {object} opts Options for running the middleware
 * @param {boolean} opts.setToContext [false] if true, also store the fetched data in the context so the data can be accessed in the handler
 * @returns {MiddlewareObj} middleware to fetch the changelog before the handler runs
 */
export const fetchChangelog = (opts: FetchChangelogOptions = {}) => {
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
