import { search } from "libs/opensearch-lib";
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
  const existingSplitSPAs = await search(domain, index, query);

  let newSplitSPAId: string;

  if (existingSplitSPAs.hits.hits.length === 0) {
    // first split SPA
    newSplitSPAId = `${spaId}-A`;
  } else {
    // get list of split SPAs for this package id and extract suffixes (letters)
    const ids = existingSplitSPAs.hits.hits.map((hit: any) => hit._source.id);
    const suffixes = ids.map((id: string) => id.split("-").at(-1));

    // convert to ASCII to find greatest letter
    const suffixCharCodes = suffixes.map((letter: string, idx: number) => letter.charCodeAt(idx));
    const lastLetterCharCode = Math.max(...suffixCharCodes);

    // increment letter but not past "Z"
    if (lastLetterCharCode >= 90) {
      // edit message
      throw new Error("This package can't be further split.");
    }
    const nextLetter = String.fromCharCode(lastLetterCharCode + 1);
    newSplitSPAId = `${spaId}-${nextLetter}`;
  }
  return newSplitSPAId;
};
