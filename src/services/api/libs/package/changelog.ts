import * as os from "../../../../libs/opensearch-lib";
import { opensearch } from "shared-types";

export const getPackageChangelog = async (
  packageId: string,
  filter: any[] = [],
) => {
  if (!process.env.osDomain) {
    throw new Error("process.env.osDomain must be defined");
  }

  return (await os.search(process.env.osDomain, "changelog", {
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
