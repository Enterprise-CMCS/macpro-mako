import { Handler } from "aws-lambda";
import * as os from "lib/libs/opensearch-lib";
import { Index } from "lib/packages/shared-types/opensearch";

export const handler: Handler = async (event, __, callback) => {
  const response = {
    statusCode: 200,
  };
  let errorResponse = null;
  try {
    if (!event.osDomain) throw "process.env.osDomain cannot be undefined";

    const indices: Index[] = [
      `${event.indexNamespace}main`,
      `${event.indexNamespace}changelog`,
      `${event.indexNamespace}insights`,
      `${event.indexNamespace}types`,
      `${event.indexNamespace}subtypes`,
      `${event.indexNamespace}legacyinsights`,
      `${event.indexNamespace}cpocs`,
    ];
    for (const index of indices) {
      await os.deleteIndex(event.osDomain, index);
    }
  } catch (error: any) {
    response.statusCode = 500;
    errorResponse = error;
  } finally {
    callback(errorResponse, response);
  }
};
