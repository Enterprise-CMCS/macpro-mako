import * as os from "libs/opensearch-lib";
import { getDomain, getOsNamespace } from "libs/utils";
import { SEATOOL_STATUS } from "shared-types";
import { BaseIndex } from "shared-types/opensearch";

export async function itemExists({
  id,
  includeDrafts = false,
}: {
  id: string;
  includeDrafts?: boolean;
}): Promise<boolean> {
  try {
    const domain = getDomain();
    const index: `${string}${BaseIndex}` = getOsNamespace("main");

    const packageResult = await os.getItem(domain, index, id);
    if (!packageResult?._source) {
      return false;
    }

    if (packageResult._source.deleted === true) {
      return false;
    }

    if (includeDrafts) {
      return true;
    }

    return packageResult._source.seatoolStatus !== SEATOOL_STATUS.DRAFT;
  } catch (error) {
    console.error(error);
    return false;
  }
}
