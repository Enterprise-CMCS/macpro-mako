import { response } from "../libs/handler";
import * as fs from "fs";
import * as path from "path";

function getAllFormsAndVersions(directoryPath: string) {
  const result: Record<string, unknown> = {};

  const subDirectories = fs.readdirSync(directoryPath);

  subDirectories.forEach((subDir) => {
    const subDirPath = path.join(directoryPath, subDir);

    if (fs.statSync(subDirPath).isDirectory()) {
      const files = fs.readdirSync(subDirPath);
      result[subDir] = files;
    }
  });

  return result;
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
