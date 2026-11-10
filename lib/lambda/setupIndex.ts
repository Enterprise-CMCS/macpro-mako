import { Handler } from "aws-lambda";
import * as os from "libs/opensearch-lib";
import { opensearch } from "shared-types";

const SHARED_INDEX_NAMESPACES = new Set(["main", "val", "production"]);
const MAIN_ROLES_INDEX = "mainroles" as opensearch.Index;
const MAIN_USERS_INDEX = "mainusers" as opensearch.Index;

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
        correlationId: { type: "keyword" },
        createdByUserId: { type: "keyword" },
        deleted: { type: "boolean" },
        finalDispositionDate: { type: "date" },
        makoChangedDate: { type: "date" },
        proposedDate: { type: "date" },
        raiId: { type: "keyword" },
        raiName: { type: "keyword" },
        raiWithdrawnToggleDate: { type: "date" },
        spaWaiverId: { type: "keyword" },
        smartRecordType: { type: "keyword" },
        smartStatus: { type: "keyword" },
        smartStatusChangedAt: { type: "date" },
        smartAdministrativeChangedAt: { type: "date" },
        smartAdministrativePreviousId: { type: "keyword" },
        smartAssignmentChangedAt: { type: "date" },
        smartCpocContactId: { type: "keyword" },
        statusDate: { type: "date" },
        submissionDate: { type: "date" },
      },
    });
    await manageIndexResource({
      osDomain: event.osDomain,
      index: `${event.indexNamespace}draftmain`,
      update: {
        changedDate: { type: "date" },
        deleted: { type: "boolean" },
        makoChangedDate: { type: "date" },
        statusDate: { type: "date" },
      },
    });
    await manageIndexResource({
      osDomain: event.osDomain,
      index: `${event.indexNamespace}changelog`,
      update: {
        raiId: { type: "keyword" },
        raiName: { type: "keyword" },
        raiWithdrawnToggleDate: { type: "date" },
      },
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
    const usersIndex = `${event.indexNamespace}users` as opensearch.Index;
    await manageIndexResource({
      osDomain: event.osDomain,
      index: usersIndex,
    });
    const rolesIndex = `${event.indexNamespace}roles` as opensearch.Index;
    await manageIndexResource({
      osDomain: event.osDomain,
      index: rolesIndex,
    });

    if (!SHARED_INDEX_NAMESPACES.has(event.indexNamespace)) {
      await os.reindexDocuments(event.osDomain, MAIN_ROLES_INDEX, rolesIndex);
      await os.reindexDocuments(event.osDomain, MAIN_USERS_INDEX, usersIndex);
    }
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
