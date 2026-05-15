import * as os from "libs/opensearch-lib";
import { getDomain, getOsNamespace } from "libs/utils";
import { BaseIndex } from "shared-types/opensearch";

import { isActiveDraftPackage, isActiveMainNonDraftPackage } from "./packageStatus";

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
    const hasMainNonDraftPackage = isActiveMainNonDraftPackage(mainPackageResult);

    if (hasMainNonDraftPackage) return true;
    if (!includeDrafts) return false;

    const draftPackageResult = await os.getItem(domain, draftIndex, id);
    const hasDraftPackage = isActiveDraftPackage(draftPackageResult);

    return hasDraftPackage;
  } catch (error) {
    console.error(error);
    return false;
  }
}
