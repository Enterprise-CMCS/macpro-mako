import * as os from "libs/opensearch-lib";
import { ErrorType, logError } from "libs/sink-lib";
import { getDomainAndNamespace } from "libs/utils";

import { SmartOnemacEventContext } from "./evaluateSmartPackageExistence";
import { getStateFromPackageId, transformMspManualRecordCreated } from "./mspManualRecordCreated";
import { SmartOnemacEvent } from "./parseSmartOnemacEvent";
import { publishSmartIngestError } from "./publishSmartIngestError";

const smartIdentityFields = (event: SmartOnemacEvent) => ({
  spaWaiverId: event.spaWaiverId,
  correlationId: event.correlationId,
});

const updateSmartIdentityFields = async (
  domain: string,
  index: ReturnType<typeof getDomainAndNamespace>["index"],
  documentId: string,
  event: SmartOnemacEvent,
): Promise<void> => {
  await os.updateItem(domain, index, documentId, smartIdentityFields(event));
};

export const persistSmartOnemacEvent = async ({
  event,
  existence,
  topicPartition,
}: SmartOnemacEventContext): Promise<boolean> => {
  const documentId = event.id.toUpperCase();
  if (!getStateFromPackageId(documentId)) {
    logError({
      type: ErrorType.VALIDATION,
      metadata: {
        topicPartition,
        id: event.id,
        reason: "package ID does not start with a known two-letter state code",
      },
    });
    await publishSmartIngestError({
      errorCode: "VALIDATION",
      topicPartition,
      kafkaKey: event.id,
      correlationId: event.correlationId,
      payload: event,
    });
    return false;
  }

  const { domain, index } = getDomainAndNamespace("main");
  if (existence.mainById) {
    await updateSmartIdentityFields(domain, index, documentId, event);
    return true;
  }

  const document = transformMspManualRecordCreated(event);
  if (!document) {
    return false;
  }

  const createResult = await os.createItem(domain, index, document);
  if (!createResult.created) {
    await updateSmartIdentityFields(domain, index, documentId, event);
  }

  return true;
};
