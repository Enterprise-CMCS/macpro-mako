import * as os from "../../opensearch-lib";
import { opensearch } from "shared-types";
import { getDomainAndNamespace } from "libs/utils";

export const getPackageChangelog = async (packageId: string, filter: any[] = []) => {
  const { index, domain } = getDomainAndNamespace("changelog");

  return (await os.search(domain, index, {
    from: 0,
    size: 200,
    sort: [{ timestamp: "desc" }],
    query: {
      bool: {
        must: [{ term: { "packageId.keyword": packageId } }].concat(filter),
      },
    },
  })) as opensearch.changelog.Response;
};
