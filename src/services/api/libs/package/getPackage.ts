import * as os from "../../../../libs/opensearch-lib";
import { ChangelogResponse, MainItemResult } from "shared-types";

export const getPackage = async (id: string) => {
  if (!process.env.osDomain) {
    throw new Error("process.env.osDomain must be defined");
  }
  const main = (await os.getItem(
    process.env.osDomain,
    "main",
    id
  )) as MainItemResult;
  const changelog = (await os.search(process.env.osDomain, "changelog", {
    from: 0,
    size: 200,
    query: { bool: { must: [{ term: { "packageId.keyword": id } }] } },
  })) as ChangelogResponse;

  return {
    ...main,
    _source: { ...main._source, changelog: changelog.hits.hits },
  };
};
