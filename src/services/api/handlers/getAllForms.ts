import { response } from "../libs/handler";
import { webformVersions } from "../webforms";
import { FormSchema } from "shared-types";

export const mapWebformsKeys = (
  webforms: Record<string, Record<string, FormSchema>>
): Record<string, string[]> => {
  const result: Record<string, string[]> = {};
  console.log(webforms);

  Object.entries(webforms).forEach(([key, value]) => {
    result[key] = Object.keys(value);
  });

  return result;
};

export const getAllForms = async () => {
  try {
    const formsWithVersions = mapWebformsKeys(webformVersions);
    console.log(formsWithVersions);
    if (formsWithVersions) {
      return response({
        statusCode: 200,
        body: formsWithVersions,
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
