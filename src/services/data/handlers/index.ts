import { Handler } from "aws-lambda";
import { send, SUCCESS, FAILED } from "cfn-response-async";
type ResponseStatus = typeof SUCCESS | typeof FAILED;
import * as os from "./../../../libs/opensearch-lib";

export const customResourceWrapper: Handler = async (event, context) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
  const responseData = {};
  let responseStatus: ResponseStatus = SUCCESS;
  try {
    if (event.RequestType == "Create" || event.RequestType == "Update") {
      await manageIndex();
    }
  } catch (error) {
    console.log(error);
    responseStatus = FAILED;
  } finally {
    console.log("finally");
    await send(event, context, responseStatus, responseData);
  }
};

export const handler: Handler = async (event) => {
  await manageIndex();
};

async function manageIndex() {
  try {
    if (!(await os.indexExists(process.env.osDomain, "main"))) {
      const createIndexReponse = await os.createIndex(
        process.env.osDomain,
        "main"
      );
      console.log(createIndexReponse);
      const updateFieldMappingResponse = await os.updateFieldMapping(
        process.env.osDomain,
        "main",
        {
          rais: {
            type: "object",
            enabled: false,
          },
        }
      );
      console.log(updateFieldMappingResponse);
    }
  } catch (error) {
    console.log(error);
    throw "ERROR:  Error occured during index management.";
  }
}
