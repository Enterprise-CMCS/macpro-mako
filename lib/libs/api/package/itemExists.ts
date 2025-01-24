import * as os from "../../../libs/opensearch-lib";
import { getDomain, getOsNamespace } from "libs/utils";
import { BaseIndex } from "lib/packages/shared-types/opensearch";

export async function itemExists({ id }: { id: string }): Promise<boolean> {
  try {
    const domain = getDomain();
    const index: `${string}${BaseIndex}` = getOsNamespace("main");

    const packageResult = await os.getItem(domain, index, id);
    return packageResult?._source !== undefined && packageResult?._source !== null;
  } catch (error) {
    console.error(error);
    return false;
  }
}
