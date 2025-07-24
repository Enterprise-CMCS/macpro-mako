import { Request } from "@middy/core";
import { getPackageChangelog } from "libs/api/package";
import { changelog } from "shared-types/opensearch";

import { getPackageFromRequest, storePackageInRequest } from "./utils";

export type FetchChangelogOptions = { setToContext?: boolean };

const defaults: FetchChangelogOptions = {
  setToContext: false,
};

/**
 * Fetches the changelog of the package, if there is any, and adds it to the package in internal storage.
 * @param {object} opts Options for running the middleware
 * @param {boolean} opts.setToContext [false] if true, also stores the package in context, so it can be accessed in the handler
 * @returns {MiddlewareObj} middleware to fetch the changelog before the handler runs
 */
export const fetchChangelog = (opts: FetchChangelogOptions = {}) => {
  const options = { ...defaults, ...opts };

  return {
    before: async (request: Request) => {
      const packageResult = await getPackageFromRequest(request);

      if (packageResult?._id) {
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

        storePackageInRequest(
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
      }
    },
  };
};
