import { response } from "../libs/handler";
import * as fs from "fs";
import * as path from "path";

interface ObjectWithArrays {
  [key: string]: string[];
}

export function removeTsAndJsExtentions(
  obj: ObjectWithArrays
): ObjectWithArrays {
  const result: ObjectWithArrays = {};

  for (const key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key)) {
      const filteredFiles = obj[key].filter((file) => !file.endsWith(".ts"));
      result[key] = filteredFiles.map((f) =>
        f.replace(".js", "").replace("v", "")
      );
    }
  }

  return result;
}

function getAllFormsAndVersions(directoryPath: string) {
  const result: ObjectWithArrays = {};

  const subDirectories = fs.readdirSync(directoryPath);

  subDirectories.forEach((subDir) => {
    const subDirPath = path.join(directoryPath, subDir);

    if (fs.statSync(subDirPath).isDirectory()) {
      const files = fs.readdirSync(subDirPath);
      result[subDir] = files;
    }
  });

  return removeTsAndJsExtentions(result);
}

export const getAllForms = async () => {
  try {
    const filePath = getAllFormsAndVersions("/opt/");

    if (filePath) {
      return response({
        statusCode: 200,
        body: filePath,
      });
    }
  } catch (error: any) {
    console.error("Error:", error);
    return response({
      statusCode: 502,
      body: JSON.stringify({
        error: error.message ? error.message : "Internal server error",
      }),
    });
  }
};

export const handler = getAllForms;
