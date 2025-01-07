import * as os from "libs/opensearch-lib";
import { getDomain, getNamespace } from "libs/utils";
import { BaseIndex } from "lib/packages/shared-types/opensearch";

export async function itemExists(params: {
  id: string;
  osDomain?: string;
  indexNamespace?: string;
}): Promise<boolean> {
  const domain = params.osDomain || getDomain();
  const index: `${string}${BaseIndex}` = params.indexNamespace
    ? `${params.indexNamespace}main`
    : getNamespace("main");

  const packageResult = await os.getItem(domain, index, params.id);
  return !!packageResult?._source;
}
