import { Handler } from "aws-lambda";
import * as os from "./../../../libs/opensearch-lib";
import { Index } from "shared-types/opensearch";

export const handler: Handler = async (_, __, callback) => {
  const response = {
    statusCode: 200,
  };
  let errorResponse = null;
  try {
    if (!process.env.osDomain) throw "process.env.osDomain cannot be undefined";

    const indices = [
      "main",
      "changelog",
      "insights",
      "types",
      "subtypes",
      "seatool", // This index is no longer used, but we want to ensure its removal.
      "legacyinsights",
    ];
    for (const index of indices) {
      await os.deleteIndex(process.env.osDomain, index as Index);
    }
  } catch (error: any) {
    response.statusCode = 500;
    errorResponse = error;
  } finally {
    callback(errorResponse, response);
  }
};
