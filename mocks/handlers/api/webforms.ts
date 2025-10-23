import { webformVersions } from "libs/webforms";
import { http, HttpResponse, PathParams } from "msw";
import { FormSchema } from "shared-types";
import { convertRegexToString } from "shared-utils";

import { WebFormRequestBody } from "../../index.d";

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

const getMaxVersion = (id: string): string => {
  const webform = webformVersions[id];

  const keys = Object.keys(webform);
  keys.sort();
  return keys[keys.length - 1];
};

const defaultApiAllWebformsHandler = http.get(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/allForms",
  () => {
    try {
      const formsWithVersions = mapWebformsKeys(webformVersions);
      if (Object.keys(formsWithVersions).length === 0) {
        throw new Error("No form Versions available");
      }
      return HttpResponse.json({
        ...formsWithVersions,
      });
    } catch (error) {
      console.error(error);
      return new HttpResponse("Internal server error", { status: 502 });
    }
  },
);

const defaultApiWebformHandler = http.post<PathParams, WebFormRequestBody>(
  "https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/forms",
  async ({ request }) => {
    try {
      const { formId, formVersion } = await request.json();

      const id = formId.toUpperCase();

      if (!webformVersions[id]) {
        return new HttpResponse("Form ID not found", { status: 400 });
      }

      let version = "v";
      if (formVersion) {
        version += formVersion;
      } else {
        version += getMaxVersion(id);
      }

      const formObj = webformVersions[id][version];
      const cleanedForm = convertRegexToString(formObj);

      return HttpResponse.json({ ...cleanedForm });
    } catch (err) {
      console.error(err);
      return new HttpResponse("Internal server error", { status: 502 });
    }
  },
);

export const webformHandlers = [defaultApiAllWebformsHandler, defaultApiWebformHandler];
