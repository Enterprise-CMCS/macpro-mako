import * as os from "libs/opensearch-lib";
import { getDomain } from "libs/utils";

export async function itemExists(params: {
  id: string;
  osDomain?: string;
  indexNamespace?: string;
}): Promise<boolean> {
  const domain = params.osDomain || getDomain();
  const index = `${params.indexNamespace ?? ""}main` as `${string}main`;

  const packageResult = await os.getItem(domain, index, params.id);
  return !!packageResult?._source;
}
