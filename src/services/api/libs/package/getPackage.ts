import * as os from "../../../../libs/opensearch-lib";
import { ItemResult } from "shared-types";

export const getPackage = async (id: string) =>
  (await os.getItem(process.env.osDomain, "main", id)) as ItemResult;
