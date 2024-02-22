import { response } from "../libs/handler";
import { APIGatewayEvent } from "aws-lambda";
import { convertRegexToString } from "shared-utils";
import { webformVersions } from "../webforms";

type GetFormBody = {
  formId: string;
  formVersion?: string;
};

export const getForm = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }
  try {
    const body = JSON.parse(event.body) as GetFormBody;
    if (!body.formId) {
      return response({
        statusCode: 400,
        body: { error: "File ID was not provided" },
      });
    }

    const id = body.formId.toUpperCase();
    console.log(id);
    if (!webformVersions[id]) {
      return response({
        statusCode: 400,
        body: { error: "Form ID not found" },
      });
    }

    let version = "v";
    if (body.formVersion) {
      version += body.formVersion;
    } else {
      version += getMaxVersion(id);
    }

    if (id && version) {
      const formObj = await webformVersions[id][version];
      const cleanedForm = convertRegexToString(formObj);
      return response({
        statusCode: 200,
        body: cleanedForm,
      });
    }
  } catch (error: any) {
    console.error("Error:", error);
    return response({
      statusCode: 502,
      body: {
        error: error.message ? error.message : "Internal server error",
      },
    });
  }
  return response({
    statusCode: 500,
    body: {
      error: "Internal server error",
    },
  });
};

function getMaxVersion(id: string): string {
  const webform = webformVersions[id];

  const keys = Object.keys(webform);
  keys.sort();
  return keys[keys.length - 1];
}

export const handler = getForm;
