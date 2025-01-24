import { search } from "libs/opensearch-lib";
import { getDomainAndNamespace } from "libs/utils";
import { cpocs } from "lib/packages/shared-types/opensearch";

export const getNextSplitSPAId = async (spaId: string) => {
  const { domain, index } = getDomainAndNamespace("main");
  const query = {
    query: {
      regexp: {
        "id.keyword": `${spaId}-[A-Z]`,
      },
    },
  };
  // Get existing split SPAs for this package id
  const { hits } = await search(domain, index, query);

  // Extract suffixes from existing split SPA IDs
  // If there are no split SPAs yet, start at the ASCII character before "A" ("@")
  // Convert to ASCII char codes to get latest suffix
  const latestSuffixCharCode = hits.hits.reduce((maxCharCode: number, hit: cpocs.ItemResult) => {
    const suffix = hit._source.id.toString().split("-").at(-1) ?? "@";
    return Math.max(maxCharCode, suffix.charCodeAt(0));
  });

  // Increment letter but not past "Z"
  // "A-Z" is 65-90 in ASCII
  if (latestSuffixCharCode >= 90) {
    throw new Error("This package can't be further split.");
  }
  const nextSuffix = String.fromCharCode(latestSuffixCharCode + 1);

  return `${spaId}-${nextSuffix}`;
};
