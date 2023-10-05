import fs from "fs";
import { APIGatewayEvent } from "aws-lambda";

export const forms = async (event: APIGatewayEvent) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const fileId = body.fileId;
    const formVersion = body.formVersion;

    if (!fileId) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: "File ID was not provided" }),
      };
    }

    const filePath = getFilepathForIdAndVersion(fileId, formVersion);
    if (!filePath) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: "File Not Found" }),
      };
    }

    const jsonData = await require(filePath);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: jsonData,
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};

function getFilepathForIdAndVersion(
  fileId: string,
  formVersion: string | undefined
): string | undefined {
  if (fileId && formVersion) {
    return `/opt/${fileId}/v${formVersion}.json`;
  }

  const files = fs.readdirSync(`/opt/${fileId}`);

  const versionNumbers = files.map((fileName: string) => {
    const match = fileName.match(/^v(\d+)\./);
    if (match) {
      return parseInt(match[1], 10);
    }
    return 1;
  });
  const maxVersion = Math.max(...versionNumbers);

  if (!maxVersion) {
    return undefined;
  }

  return `/opt/${fileId}/v${maxVersion}.json`;
}

export const handler = forms;
