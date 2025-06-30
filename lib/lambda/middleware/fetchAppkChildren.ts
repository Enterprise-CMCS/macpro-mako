import { Request } from "@middy/core";
import { createError, getInternal } from "@middy/util";
import { getAppkChildren } from "libs/api/package";
import { ItemResult } from "shared-types/opensearch/main";

const defaults = {
  setToContext: false,
};

export const fetchAppkChildren = (opts: { setToContext?: boolean } = {}) => {
  const options = { ...defaults, ...opts };

  return {
    before: async (request: Request) => {
      const { packageResult } = (await getInternal("packageResult", request)) as {
        packageResult: ItemResult;
      };

      if (!packageResult?._id) {
        throw createError(500, JSON.stringify({ message: "Internal server error" }));
      }

      let appkChildren: any[] = [];
      // @ts-ignore appkParent is a legacy field
      if (packageResult?._source?.appkParent) {
        const children = await getAppkChildren(packageResult._id);
        appkChildren = children.hits.hits;
      }

      if (appkChildren.length > 0) {
        const updatedPackage: ItemResult = {
          ...packageResult,
          _source: {
            ...packageResult._source,
            appkChildren,
          },
        };

        Object.assign(request.internal, { packageResult: updatedPackage });

        if (options.setToContext) {
          Object.assign(request.context, { packageResult: updatedPackage });
        }
      }
    },
  };
};
