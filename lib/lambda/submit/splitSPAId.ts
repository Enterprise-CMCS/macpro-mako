import { search } from "libs/opensearch-lib";
import { getPackage } from "libs/api/package";
import { getDomainAndNamespace } from "libs/utils";

export const getNextSplitSPAId = async (spaId: string) => {
  const { domain, index } = getDomainAndNamespace("main");
  const query = {
    query: {
      regexp: {
        "id.keyword": `${spaId}-[A-Z]`, // only allow capital letters
      },
    },
  };
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
    console.log(matchingSplitSPAs, "HELLOOO");
    return newSplitSPAId;
  }
  // } else {
  //   const ids = matchingSplitSPAs.hits.hits.map((hit: any) => hit._source.id);
  //   console.log(ids);
  //   const suffixes = ids.map((id: string) => id.split("-")[1]);
  //   console.log(suffixes, "LETTERS");
  // }
};
