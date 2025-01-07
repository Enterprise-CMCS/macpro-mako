import { ItemResult } from "lib/packages/shared-types/opensearch/main";
import * as os from "libs/opensearch-lib";
import { getDomainAndNamespace } from "libs/utils";

export interface ExtendedItemResult extends ItemResult {
  appkChildren?: any[];
}
export const getPackage = async (id: string): Promise<ItemResult | undefined> => {
  const { index, domain } = getDomainAndNamespace("main");
  const packageResult = await os.getItem(domain, index, id);

  return packageResult;
};
