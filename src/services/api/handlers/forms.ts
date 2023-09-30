import { response } from "../libs/handler";
import { APIGatewayEvent } from "aws-lambda";
import { getStateFilter } from "../libs/auth/user";
import * as os from "../../../libs/opensearch-lib";
if (!process.env.osDomain) {
  throw "ERROR:  osDomain env variable is required,";
}

// Handler function to search index
export const forms = async (event: APIGatewayEvent) => {
  return console.log("layer test");
};

export const handler = forms;
