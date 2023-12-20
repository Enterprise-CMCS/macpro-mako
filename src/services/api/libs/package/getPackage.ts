import * as os from "../../../../libs/opensearch-lib";
import { ItemResult } from "shared-types";

export const getPackage = async (id: string) => {
  if (!process.env.osDomain) {
    throw new Error("process.env.osDomain must be defined");
  }
  return (await os.getItem(process.env.osDomain, "main", id)) as ItemResult;
};
