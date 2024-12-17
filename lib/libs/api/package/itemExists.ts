import * as os from "../../../libs/opensearch-lib";

export async function itemExists(params: {
  id: string;
  osDomain?: string;
  indexNamespace?: string;
}): Promise<boolean> {
  try {
    const packageResult = await os.getItem(
      params.osDomain || process.env.osDomain!,
      `${params.indexNamespace || process.env.indexNamespace!}main`,
      params.id,
    );
    return !!packageResult?._source;
  } catch (error) {
    console.error("Error checking item existence in OpenSearch:", error);
    return false;
  }
}
