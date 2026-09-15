import * as os from "libs/opensearch-lib";
import { ErrorType, logError } from "libs/sink-lib";
import { getDomainAndNamespace } from "libs/utils";

import { SmartOnemacEventContext } from "./evaluateSmartPackageExistence";
import { getStateFromPackageId, transformMspManualRecordCreated } from "./mspManualRecordCreated";
import { SmartOnemacEvent } from "./parseSmartOnemacEvent";
import { publishSmartIngestError } from "./publishSmartIngestError";
import { reportSmartValidationFailure, resolveSmartPackage } from "./smartEventHelpers";

const smartIdentityFields = (
  event: SmartOnemacEvent,
  document: { spaWaiverId?: string; correlationId?: string },
) => ({
  ...(!document.spaWaiverId ? { spaWaiverId: event.spaWaiverId } : {}),
  // A blank SMART correlation ID is valid, but it should not erase an
  // identifier previously associated with an existing OneMAC package.
  ...(!document.correlationId && event.correlationId ? { correlationId: event.correlationId } : {}),
});

const updateSmartIdentityFields = async (
  domain: string,
  index: ReturnType<typeof getDomainAndNamespace>["index"],
  documentId: string,
  event: SmartOnemacEvent,
  document: { spaWaiverId?: string; correlationId?: string },
): Promise<void> => {
  const fields = smartIdentityFields(event, document);
  if (Object.keys(fields).length > 0) {
    await os.updateItem(domain, index, documentId, fields);
  }
};

export const persistSmartOnemacEvent = async (
  context: SmartOnemacEventContext,
): Promise<boolean> => {
  const { event, topicPartition, kafkaKey, kafkaOffset, kafkaTimestamp } = context;
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
      kafkaKey: kafkaKey ?? event.id,
      kafkaOffset,
      kafkaTimestamp,
      correlationId: event.correlationId,
      payload: event,
    });
    return false;
  }

  const { domain, index } = getDomainAndNamespace("main");
  const resolution = resolveSmartPackage(context);
  if (resolution instanceof Error) {
    await reportSmartValidationFailure(context, resolution);
    return false;
  }
  if (resolution) {
    if (
      resolution.document.deleted === true ||
      (resolution.document.authority && resolution.document.authority !== event.authority)
    ) {
      await reportSmartValidationFailure(
        context,
        new Error("SMART identity requires a non-deleted package with matching authority"),
      );
      return false;
    }
    await updateSmartIdentityFields(
      domain,
      index,
      resolution.documentId,
      event,
      resolution.document,
    );
    return true;
  }

  const document = transformMspManualRecordCreated(event);
  if (!document) {
    return false;
  }

  const createResult = await os.createItem(domain, index, document);
  if (!createResult.created) {
    const racedPackage = await os.getItem(domain, index, documentId);
    if (
      !racedPackage?._source ||
      racedPackage._source.deleted === true ||
      (racedPackage._source.authority && racedPackage._source.authority !== event.authority) ||
      (racedPackage._source.spaWaiverId && racedPackage._source.spaWaiverId !== event.spaWaiverId)
    ) {
      await reportSmartValidationFailure(
        context,
        new Error("package ID was claimed by another record during processing"),
      );
      return false;
    }
    await updateSmartIdentityFields(domain, index, documentId, event, racedPackage._source);
  }

  return true;
};
