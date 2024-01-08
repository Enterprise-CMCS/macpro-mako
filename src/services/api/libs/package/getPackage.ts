import * as os from "../../../../libs/opensearch-lib";
import { opensearch } from "shared-types";

export const getPackage = async (id: string) => {
  if (!process.env.osDomain) {
    throw new Error("process.env.osDomain must be defined");
  }
  const main = (await os.getItem(
    process.env.osDomain,
    "main",
    id
  )) as opensearch.main.ItemResult;
  const changelog = (await os.search(process.env.osDomain, "changelog", {
    from: 0,
    size: 200,
    // NOTE: get the required timestamp sort field
    sort: [{ timestamp: "desc" }],
    query: { bool: { must: [{ term: { "packageId.keyword": id } }] } },
  })) as opensearch.changelog.Response;

  return {
    ...main,
    _source: { ...main._source, changelog: changelog.hits.hits },
  } as opensearch.main.ItemResult;
};
