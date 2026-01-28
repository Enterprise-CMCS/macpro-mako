import { Handler } from "aws-lambda";
import * as os from "libs/opensearch-lib";
import { Index } from "shared-types/opensearch";

export const handler: Handler = async (event, __, callback) => {
  const response = {
    statusCode: 200,
  };
  // Using a Set so that it doesn't duplicate errors
  const errorMessages: Set<string> = new Set<string>();
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
      `${indexNamespace}users`,
      `${indexNamespace}roles`,
      `${indexNamespace}datasink`,
    ];
    for (const index of indices) {
      try {
        await os.deleteIndex(osDomain, index);
      } catch (error: any) {
        try {
          console.log(`Failed to delete index ${index}, error ${error}, trying again...`);
          await os.deleteIndex(osDomain, index);
        } catch (error2) {
          console.log(`Failed to delete index ${index} again, error, ${error2}`);
          response.statusCode = 500;
          errorMessages.add(`Error deleting index ${index}: ${error2.message || error2}`);
        }
      }
    }

    if (errorMessages.size > 0) {
      errorResponse = new Error([...errorMessages].join("\n\n"));
    }
  } catch (error: any) {
    response.statusCode = 500;
    errorResponse = error;
  } finally {
    callback(errorResponse, response);
  }
};
