import * as os from "libs/opensearch-lib";
import { opensearch } from "shared-types";

import { getDomainAndNamespace } from "../../utils";

export const getPackageChangelog = async (packageId: string, filter: any[] = []) => {
  const { domain, index } = getDomainAndNamespace("changelog");
  const osResponse = await (os.search(domain, index, {
    from: 0,
    size: 200,
    sort: [{ timestamp: "desc" }],
    query: {
      bool: {
        must: [{ term: { "packageId.keyword": packageId } }].concat(filter),
      },
    },
  })) as opensearch.changelog.Response;
  console.log("getPackageChangelog osResponse: ", osResponse)
  return osResponse;
  // return (await os.search(domain, index, {
  //   from: 0,
  //   size: 200,
  //   sort: [{ timestamp: "desc" }],
  //   query: {
  //     bool: {
  //       must: [{ term: { "packageId.keyword": packageId } }].concat(filter),
  //     },
  //   },
  // })) as opensearch.changelog.Response;
};
