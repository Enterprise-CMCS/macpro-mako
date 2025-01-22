import { search } from "libs/opensearch-lib";
import { getPackage } from "libs/api/package";
import { getDomainAndNamespace } from "libs/utils";

export const getNextSplitSPAId = async (spaId: string) => {
  const { domain, index } = getDomainAndNamespace("main");
  const query = {
    query: {
      regexp: {
        "id.keyword": `${spaId}-[A-Z]`,
      },
    },
  };
  // get existing split SPAs for this package id
  const matchingSplitSPAs = await search(domain, index, query);

  let newSplitSPAId: string;

  if (matchingSplitSPAs.hits.hits.length === 0) {
    // make sure package exists
    const currentPackage = await getPackage(spaId);
    if (currentPackage && currentPackage.found) {
      newSplitSPAId = `${spaId}-A`;
      return newSplitSPAId;
    }
  } else {
    newSplitSPAId = "";
    const ids = matchingSplitSPAs.hits.hits.map((hit: any) => hit._source.id);
    console.log(ids);
    const suffixes = ids.map((id: string) => id.split("-").at(-1));
    const letterCharCodes = suffixes.map((letter: string, idx: number) => letter.charCodeAt(idx));
    const lastLetter = Math.max(letterCharCodes);
    console.log(letterCharCodes, "LETTERS");
    console.log(lastLetter, "last letter");
    return newSplitSPAId;
  }
};
