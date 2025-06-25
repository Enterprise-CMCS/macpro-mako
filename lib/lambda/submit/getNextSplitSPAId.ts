import { ItemResult } from "lib/packages/shared-types/opensearch/main";
import { search } from "libs/opensearch-lib";
import { getDomainAndNamespace } from "libs/utils";

// Split SPAs can be created before or after existing in SEAtool.
// If the latest split SPA comes from SEAtool, keep that suffix. If coming from OneMAC, increment letter
export const getNextSplitSPAId = async (spaId: string) => {
  const { domain, index } = getDomainAndNamespace("main");
  const query = {
    size: 50,
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
  let latestSplitSpa: ItemResult | null = null;
  let latestSuffixCharCode = "@".charCodeAt(0);

  for (const hit of hits.hits) {
    const suffix = hit._source.id.toString().split("-").at(-1) ?? "@";
    const currentCharCode = suffix.charCodeAt(0);

    if (currentCharCode > latestSuffixCharCode) {
      latestSuffixCharCode = currentCharCode;
      latestSplitSpa = hit;
    }
  }

  // If a package was initially created in SEAtool, origin is undefined
  const isFromOneMAC = latestSplitSpa?._source.origin === "OneMAC";

  // Increment letter if latest split SPA exists in OneMAC but not past "Z"
  // "A-Z" is 65-90 in ASCII
  if (latestSuffixCharCode === 90 && isFromOneMAC) {
    throw new Error("This package can't be further split.");
  }

  // Keep the suffix for the SEAtool package to create this package in OneMAC
  const nextSuffix = isFromOneMAC
    ? String.fromCharCode(latestSuffixCharCode) + 1
    : String.fromCharCode(latestSuffixCharCode);

  return `${spaId}-${nextSuffix}`;
};
