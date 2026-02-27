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
    const mainIndex: `${string}${BaseIndex}` = getOsNamespace("main");
    const draftIndex: `${string}${BaseIndex}` = getOsNamespace("draftmain");

    const mainPackageResult = await os.getItem(domain, mainIndex, id);
    const hasMainNonDraftPackage =
      mainPackageResult?.found === true &&
      mainPackageResult._source?.deleted !== true &&
      mainPackageResult._source?.seatoolStatus !== SEATOOL_STATUS.DRAFT;

    if (hasMainNonDraftPackage) return true;
    if (!includeDrafts) return false;

    const draftPackageResult = await os.getItem(domain, draftIndex, id);
    const hasDraftPackage =
      draftPackageResult?.found === true &&
      draftPackageResult._source?.deleted !== true &&
      draftPackageResult._source?.seatoolStatus === SEATOOL_STATUS.DRAFT;

    return hasDraftPackage;
  } catch (error) {
    console.error(error);
    return false;
  }
}
