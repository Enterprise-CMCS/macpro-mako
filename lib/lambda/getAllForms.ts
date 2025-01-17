import { response } from "libs/handler-lib";
import { webformVersions } from "../libs/webforms";
import { FormSchema } from "shared-types";

export const mapWebformsKeys = (
  webforms: Record<string, Record<string, FormSchema>>,
): Record<string, string[]> => {
  const result: Record<string, string[]> = {};

  Object.entries(webforms).forEach(([key, value]) => {
    result[key] = Object.keys(value).map((v) => v.replace("v", ""));
  });

  return result;
};

export const getAllForms = async () => {
  try {
    const formsWithVersions = mapWebformsKeys(webformVersions);

    if (Object.keys(formsWithVersions).length === 0) {
      throw new Error("No form Versions available");
    }
    return response({
      statusCode: 200,
      body: formsWithVersions,
    });
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
