import * as os from "../../../../libs/opensearch-lib";
import { opensearch } from "shared-types";

export const getPackage = async (id: string, ignoreCase = false) => {
  if (!process.env.osDomain) {
    throw new Error("process.env.osDomain must be defined");
  }
  return (await os.getItem(
    process.env.osDomain,
    "main",
    id,
    ignoreCase
  )) as opensearch.main.ItemResult;
};
