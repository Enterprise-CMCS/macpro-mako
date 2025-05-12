import * as os from "libs/opensearch-lib";
import { opensearch } from "shared-types";

import { getDomainAndNamespace } from "../../utils";

export const getPackageChangelogTimestamp = async (timestamp: number, filter: any[] = []) => {
  const { domain, index } = getDomainAndNamespace("changelog");

  return (await os.search(domain, index, {
    from: 0,
    size: 200,
    sort: [{ timestamp: "desc" }],
    query: {
      bool: {
        must: [{ term: { "timestamp.keyword": timestamp } }].concat(filter),
      },
    },
  })) as opensearch.changelog.Response;
};
