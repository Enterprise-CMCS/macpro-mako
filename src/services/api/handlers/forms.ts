import { APIGatewayEvent } from "aws-lambda";

export const forms = async (event: APIGatewayEvent) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const fileId = body.fileId;
    const version = body.version;

    const filePath = getFilepathForIdAndVersion(fileId, version);
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
  version: string
): string | undefined {
  if (fileId && version) {
    return `/opt/${fileId}_${version}.json`;
  }

  return "/opt/form_v1.json";
}

export const handler = forms;
