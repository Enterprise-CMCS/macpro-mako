import { Handler } from "aws-lambda";
import * as os from "../libs/opensearch-lib";
import { opensearch } from "../packages/shared-types";

export const handler: Handler = async (event, __, callback) => {
  const response = {
    statusCode: 200,
  };
  let errorResponse = null;
  try {
    await manageIndexResource({
      osDomain: event.osDomain,
      index: "main",
      update: {
        approvedEffectiveDate: { type: "date" },
        changedDate: { type: "date" },
        finalDispositionDate: { type: "date" },
        proposedDate: { type: "date" },
        statusDate: { type: "date" },
        submissionDate: { type: "date" },
      },
    });
    await manageIndexResource({ osDomain: event.osDomain, index: "changelog" });
    await manageIndexResource({ osDomain: event.osDomain, index: "types" });
    await manageIndexResource({ osDomain: event.osDomain, index: "subtypes" });
    await manageIndexResource({ osDomain: event.osDomain, index: "cpocs" });
    await manageIndexResource({ osDomain: event.osDomain, index: "insights" });
    await manageIndexResource({
      osDomain: event.osDomain,
      index: "legacyinsights",
    });
  } catch (error: any) {
    response.statusCode = 500;
    errorResponse = error;
  } finally {
    callback(errorResponse, response);
  }
};

const manageIndexResource = async (resource: {
  osDomain: string;
  index: opensearch.Index;
  update?: object;
}) => {
  await os.createIndex(resource.osDomain, resource.index);
  if (!resource.update) return;
  await os.updateFieldMapping(
    resource.osDomain,
    resource.index,
    resource.update
  );
};
