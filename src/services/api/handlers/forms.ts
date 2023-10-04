const fs = require("fs");

export const forms = async (event) => {
  try {
    console.log("event:::", event);
    // const body = JSON.parse(event.body);
    const fileId = event.queryStringParameters?.formId;
    const version = event.queryStringParameters?.version;

    const filePath = getFilepathForIdAndVersion(fileId, version);
    console.log(filePath);
    const cwd = process.cwd();
    console.log("CWD", cwd);
    if (fs.existsSync("/opt")) {
      console.log("Directory exists");
      // You can proceed with reading files or performing other operations within the directory
    } else {
      console.log("Directory does not exist");
      // Handle the case where the directory does not exist
    }

    const jsonData3 = require("/opt/forms/form_v1.json");

    console.log(jsonData, jsonData2, jsonData3);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: jsonData3,
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
