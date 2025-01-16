import { ItemResult } from "shared-types/opensearch/main";
import * as os from "libs/opensearch-lib";
import { getDomainAndNamespace } from "../../utils";

export interface ExtendedItemResult extends ItemResult {
  appkChildren?: any[];
}
export const getPackage = async (id: string): Promise<ItemResult | undefined> => {
  const { domain, index } = getDomainAndNamespace("main");
console.log(domain, "DOMAIN");
console.log(index, "INDEX");
console.log(id, "WHATS THE ID");
  const packageResult = await os.getItem(domain, index, id);
  console.log(packageResult, "WHAT?");
  return packageResult;
};
