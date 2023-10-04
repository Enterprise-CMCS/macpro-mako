import { APIGatewayEvent } from "aws-lambda";
const fs = require("fs");

export const forms = async (event: APIGatewayEvent) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const fileId = body.fileId;
    const formVersion = body.formVersion;

    const files = fs.readdirSync(/opt/);
    console.log("dir:", files);

    const filePath = getFilepathForIdAndVersion(fileId, formVersion);
    console.log(filePath);
    const jsonData = await require(filePath);
    console.log(jsonData);

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
  formVersion: string
): string | undefined {
  if (fileId && formVersion) {
    return `/opt/${fileId}/v${formVersion}.json`;
  }

  return "/opt/testform/v1.json";
}

export const handler = forms;
