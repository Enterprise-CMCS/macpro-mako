import { ItemResult } from "lib/packages/shared-types/opensearch/main";
import { getItem } from "libs/opensearch-lib";

export interface ExtendedItemResult extends ItemResult {
  appkChildren?: any[];
}
export const getPackage = async (id: string): Promise<ItemResult | undefined> => {
  if (!process.env.osDomain) {
    throw new Error("process.env.osDomain must be defined");
  }
  const packageResult = await getItem(
    process.env.osDomain,
    `${process.env.indexNamespace}main`,
    id,
  );

  return packageResult as any;
};
