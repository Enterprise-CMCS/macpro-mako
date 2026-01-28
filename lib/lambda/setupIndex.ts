import { Handler } from "aws-lambda";
import * as os from "libs/opensearch-lib";
import { opensearch } from "shared-types";

export const handler: Handler = async (event, __, callback) => {
  const response = {
    statusCode: 200,
  };
  let errorResponse = null;
  try {
    await manageIndexResource({
      osDomain: event.osDomain,
      index: `${event.indexNamespace}main`,
      update: {
        approvedEffectiveDate: { type: "date" },
        changedDate: { type: "date" },
        finalDispositionDate: { type: "date" },
        proposedDate: { type: "date" },
        statusDate: { type: "date" },
        submissionDate: { type: "date" },
      },
    });
    await manageIndexResource({
      osDomain: event.osDomain,
      index: `${event.indexNamespace}changelog`,
    });
    await manageIndexResource({
      osDomain: event.osDomain,
      index: `${event.indexNamespace}types`,
    });
    await manageIndexResource({
      osDomain: event.osDomain,
      index: `${event.indexNamespace}subtypes`,
    });
    await manageIndexResource({
      osDomain: event.osDomain,
      index: `${event.indexNamespace}cpocs`,
    });
    await manageIndexResource({
      osDomain: event.osDomain,
      index: `${event.indexNamespace}insights`,
    });
    await manageIndexResource({
      osDomain: event.osDomain,
      index: `${event.indexNamespace}legacyinsights`,
    });
    await manageIndexResource({
      osDomain: event.osDomain,
      index: `${event.indexNamespace}users`,
    });
    await manageIndexResource({
      osDomain: event.osDomain,
      index: `${event.indexNamespace}roles`,
    });
    await manageIndexResource({
      osDomain: event.osDomain,
      index: `${event.indexNamespace}datasink`,
      update: {
        eventId: { type: "keyword" },
        source: { type: "keyword" },
        recordType: { type: "keyword" },
        eventType: { type: "keyword" },
        eventTime: { type: "date" },
        correlationId: { type: "keyword" },
        schemaVersion: { type: "keyword" },
        receivedAt: { type: "date" },
        processedAt: { type: "date" },
        status: { type: "keyword" },
        // Outbound event fields
        direction: { type: "keyword" },
        targetEndpoint: { type: "keyword" },
        httpStatusCode: { type: "integer" },
        lastAttemptAt: { type: "date" },
        attemptCount: { type: "integer" },
        businessKey: { type: "keyword" },
      },
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
  await os.updateFieldMapping(resource.osDomain, resource.index, resource.update);
};
