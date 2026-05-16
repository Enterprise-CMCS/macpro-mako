import * as os from "libs/opensearch-lib";
import { BaseIndex } from "shared-types/opensearch";
import type { ItemResult } from "shared-types/opensearch/main";

import { getDomainAndNamespace } from "../../utils";

export interface ExtendedItemResult extends ItemResult {
  appkChildren?: Omit<ItemResult, "found">[];
}

const getPackageByIndex = async (
  id: string,
  baseIndex: BaseIndex,
): Promise<ItemResult | undefined> => {
  const { domain, index } = getDomainAndNamespace(baseIndex);
  return await os.getItem(domain, index, id);
};

export const getPackage = async (id: string): Promise<ItemResult | undefined> =>
  getPackageByIndex(id, "main");

export const getDraftPackage = async (id: string): Promise<ItemResult | undefined> =>
  getPackageByIndex(id, "draftmain");
