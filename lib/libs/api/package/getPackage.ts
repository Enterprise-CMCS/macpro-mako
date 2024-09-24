import * as os from "libs/opensearch-lib";
import { opensearch } from "shared-types";
// import { getAppkChildren } from "./appk";

export interface ExtendedItemResult extends opensearch.main.ItemResult {
  appkChildren?: any[]; // Add appkChildren field
}
export const getPackage = async (id: string) => {
  if (!process.env.osDomain) {
    throw new Error("process.env.osDomain must be defined");
  }
  const packageResult = (await os.getItem(
    process.env.osDomain,
    `${process.env.indexNamespace}main`,
    id,
  )) as ExtendedItemResult;
  // TODO:  appks need to be handled.  it will not be like this however.
  // if (packageResult._source.appkParent) {
  //   const children = await getAppkChildren(packageResult._id);
  //   return {
  //     ...packageResult,
  //     _source: {
  //       ...packageResult._source,
  //       appkChildren: children.hits.hits,
  //     },
  //   };
  // }
  return packageResult;
};
