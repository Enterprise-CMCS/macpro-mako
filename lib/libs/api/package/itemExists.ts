import { BaseIndex } from "lib/packages/shared-types/opensearch";
import { getDomain, getOsNamespace } from "libs/utils";

import * as os from "../../opensearch-lib";

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
