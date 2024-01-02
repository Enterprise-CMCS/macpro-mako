import { Handler } from "aws-lambda";
import { send, SUCCESS, FAILED } from "cfn-response-async";
type ResponseStatus = typeof SUCCESS | typeof FAILED;
import * as os from "./../../../libs/opensearch-lib";
import { OsIndex } from "shared-types";

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

export const handler: Handler = async () => {
  await manageIndex();
};

const manageIndexResource = async (resource: {
  index: OsIndex;
  update?: object;
}) => {
  if (!process.env.osDomain) {
    throw new Error("process.env.osDomain must be defined");
  }

  const createIndex = await os.createIndex(
    process.env.osDomain,
    resource.index
  );
  console.log({ createIndex });

  if (!resource.update) return;

  const updateFieldMapping = await os.updateFieldMapping(
    process.env.osDomain,
    resource.index,
    resource.update
  );
  console.log(updateFieldMapping);
};

async function manageIndex() {
  try {
    await manageIndexResource({
      index: "main",
      // TODO: remove after rai transform
      update: { rais: { type: "object", enabled: false } },
    });

    await manageIndexResource({ index: "changelog" });
    await manageIndexResource({ index: "seatool" });
  } catch (error) {
    console.log(error);
    throw "ERROR:  Error occured during index management.";
  }
}
