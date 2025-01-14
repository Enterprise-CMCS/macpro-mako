import * as os from "../../opensearch-lib";
import { opensearch } from "shared-types";
import { getDomainAndNamespace } from "../../utils";

export const getAppkChildren = async (packageId: string, filter: any[] = []) => {
  const { domain, index } = getDomainAndNamespace("main");

  const response = (await os.search(domain, index, {
    from: 0,
    size: 200,
    query: {
      bool: {
        must: [{ term: { "appkParentId.keyword": packageId } }].concat(filter),
      },
    },
  })) as opensearch.main.Response;

  return response;
};
