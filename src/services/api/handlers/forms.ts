export const forms = async (event) => {
  try {
    console.log(event.body);
    const fileId = event.queryStringParameters?.formId;
    const version = event.queryStringParameters?.version;

    const filePath = getFilepathForIdAndVersion(fileId, version);
    console.log(filePath);
    const jsonData = require("/opt/myLayer/form_v1.json");

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
    return `path/to/${fileId}_${version}.json`;
  }

  return undefined;
}

export const handler = forms;
