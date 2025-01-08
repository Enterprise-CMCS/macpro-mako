import { Handler } from "aws-lambda";
import * as os from "libs/opensearch-lib";
import { Index } from "../packages/shared-types/opensearch";

export const handler: Handler = async (event, __, callback) => {
  const response = {
    statusCode: 200,
  };
  let errorResponse = null;
  try {
    const { osDomain, indexNamespace = "" } = event;
    if (!osDomain) throw "osDomain cannot be undefined";

    const indices: Index[] = [
      `${indexNamespace}main`,
      `${indexNamespace}changelog`,
      `${indexNamespace}insights`,
      `${indexNamespace}types`,
      `${indexNamespace}subtypes`,
      `${indexNamespace}legacyinsights`,
      `${indexNamespace}cpocs`,
    ];
    for (const index of indices) {
      await os.deleteIndex(osDomain, index);
    }
  } catch (error: any) {
    response.statusCode = 500;
    errorResponse = error;
  } finally {
    callback(errorResponse, response);
  }
};
