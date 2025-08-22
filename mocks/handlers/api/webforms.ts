import { webformVersions } from "libs/webforms";
import { http, HttpResponse } from "msw";
import { FormSchema } from "shared-types";

// copying this from lib/lambda/getAllForms because it's not exported
const mapWebformsKeys = (
  webforms: Record<string, Record<string, FormSchema>>,
): Record<string, string[]> => {
  const result: Record<string, string[]> = {};

  Object.entries(webforms).forEach(([key, value]) => {
    result[key] = Object.keys(value).map((v) => v.replace("v", ""));
  });

  return result;
};

const defaultApiWebformsHandler = http.get(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/allForms",
  () => {
    try {
      const formsWithVersions = mapWebformsKeys(webformVersions);

      if (Object.keys(formsWithVersions).length === 0) {
        throw new Error("No form Versions available");
      }
      return HttpResponse.json({
        formsWithVersions,
      });
    } catch (error) {
      console.error(error);
      return new HttpResponse("Internal server error", { status: 502 });
    }
  },
);

export const webformHandlers = [defaultApiWebformsHandler];
