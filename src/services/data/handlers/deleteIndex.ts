import { Handler } from "aws-lambda";
import * as os from "./../../../libs/opensearch-lib";
import { Index } from "shared-types/opensearch";

export const handler: Handler = async (
  _,
  __,
  callback
) => {
  const response = {
    statusCode: 200,
  };
  let errorResponse = null;
  try {
    if (!process.env.osDomain) {
      throw "process.env.osDomain cannot be undefined";
    }
    const indices = ["main", "changelog", "seatool", "types", "subtypes"];
    for (const index of indices) {
      try {
        await os.deleteIndex(process.env.osDomain, index as Index);
      } catch (error: any) {
        if (error.meta.body.error.type == "index_not_found_exception") {
          console.log("Index does not exist.");
          continue;
        } else {
          throw error;
        }
      }
    }
  } catch (error: any) {
    response.statusCode = 500;
    errorResponse = error;
  } finally {
    callback(errorResponse, response);
  }
};
