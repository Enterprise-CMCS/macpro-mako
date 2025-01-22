import { search } from "libs/opensearch-lib";
// import { getPackage } from "libs/api/package";
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
    // const currentPackage = await getPackage(spaId);
    // if (currentPackage && currentPackage.found) {
    newSplitSPAId = `${spaId}-A`;
    return newSplitSPAId;
    // }
  } else {
    newSplitSPAId = "";
    const ids = matchingSplitSPAs.hits.hits.map((hit: any) => hit._source.id);
    console.log(ids);
    const suffixes = ids.map((id: string) => id.split("-").at(-1));
    const letterCharCodes = suffixes.map((letter: string, idx: number) => letter.charCodeAt(idx));
    const lastLetterCharCode = Math.max(...letterCharCodes);
    if (lastLetterCharCode >= 90) {
      // edit message
      throw new Error("This package can't be further split.");
    }
    const nextLetter = String.fromCharCode(lastLetterCharCode + 1);
    newSplitSPAId = `${spaId}-${nextLetter}`;
    console.log(letterCharCodes, "LETTERS");
    console.log(newSplitSPAId, "NEW SPLIT SPA ID");
    // console.log(lastLetter, "last letter");
    return newSplitSPAId;
  }
};
