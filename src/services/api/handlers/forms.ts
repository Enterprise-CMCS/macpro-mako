import { response } from "../libs/handler";
import * as fs from "fs";
import { APIGatewayEvent } from "aws-lambda";
import { convertRegexToString } from "shared-utils";

export const forms = async (event: APIGatewayEvent) => {
  try {
    const formId = event.queryStringParameters?.formId?.toLocaleUpperCase();
    let formVersion = event.queryStringParameters?.formVersion;

    if (!formId) {
      return response({
        statusCode: 400,
        body: JSON.stringify({ error: "File ID was not provided" }),
      });
    }

    const filePath = getFilepathForIdAndVersion(formId, formVersion);

    if (!filePath) {
      return response({
        statusCode: 404,
        body: JSON.stringify({
          error: "No file was found with provided formId and formVersion",
        }),
      });
    }

    const jsonData = await fs.promises.readFile(filePath, "utf-8");

    if (!jsonData) {
      return response({
        statusCode: 404,
        body: JSON.stringify({
          error: `File found for ${formId}, but it's empty`,
        }),
      });
    }

    if (!formVersion) formVersion = getMaxVersion(formId);

    try {
      const formObj = await import(`/opt/${formId}/v${formVersion}.js`);

      if (formObj?.form) {
        const cleanedForm = convertRegexToString(formObj.form);
        return response({
          statusCode: 200,
          body: cleanedForm,
        });
      }
    } catch (importError) {
      console.error("Error importing module:", importError);
      return response({
        statusCode: 500,
        body: JSON.stringify({
          error: importError.message
            ? importError.message
            : "Internal server error",
        }),
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return response({
      statusCode: 502,
      body: JSON.stringify({
        error: error.message ? error.message : "Internal server error",
      }),
    });
  }
};

export function getMaxVersion(formId: string) {
  const files = fs.readdirSync(`/opt/${formId}`);
  if (!files) return undefined;
  const versionNumbers = files?.map((fileName: string) => {
    const match = fileName.match(/^v(\d+)\./);
    if (match) {
      return parseInt(match[1], 10);
    }
    return 1;
  });
  return Math.max(...versionNumbers).toString();
}

export function getFilepathForIdAndVersion(
  formId: string,
  formVersion: string | undefined
): string | undefined {
  if (formId && formVersion) {
    return `/opt/${formId}/v${formVersion}.js`;
  }

  const maxVersion = getMaxVersion(formId);

  if (!maxVersion) return undefined;
  return `/opt/${formId}/v${maxVersion}.js`;
}

export const handler = forms;
