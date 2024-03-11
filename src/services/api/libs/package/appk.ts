import * as os from "../../../../libs/opensearch-lib";
import { opensearch } from "shared-types";

export const getAppkChildren = async (
  packageId: string,
  filter: any[] = []
) => {
  if (!process.env.osDomain) {
    throw new Error("process.env.osDomain must be defined");
  }

  const response = (await os.search(process.env.osDomain, "main", {
    from: 0,
    size: 200,
    query: {
      bool: {
        must: [{ term: { "appkParentId.keyword": packageId } }].concat(filter),
      },
    },
  })) as opensearch.changelog.Response;

  return response;
};
