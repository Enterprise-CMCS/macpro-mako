import * as os from "libs/opensearch-lib";
import { ErrorType, logError } from "libs/sink-lib";
import { getDomainAndNamespace } from "libs/utils";

import { SmartOnemacEventContext } from "./evaluateSmartPackageExistence";
import { getStateFromPackageId, transformMspManualRecordCreated } from "./mspManualRecordCreated";
import { SmartOnemacEvent } from "./parseSmartOnemacEvent";
import { publishSmartIngestError } from "./publishSmartIngestError";
import { reportSmartValidationFailure } from "./smartEventHelpers";

interface ExistingSmartIdentity {
  spaWaiverId?: string | null;
}

const smartIdentityFields = (
  event: SmartOnemacEvent,
  existing: ExistingSmartIdentity,
): Record<string, string> | Error => {
  const storedSpaWaiverId = existing.spaWaiverId?.trim();
  if (storedSpaWaiverId && storedSpaWaiverId !== event.spaWaiverId) {
    return new Error("id is already associated with another external identifier");
  }

  return {
    // Once an external identifier is associated with a package ID, later SMART
    // events may confirm it but must not replace it.
    ...(!storedSpaWaiverId ? { spaWaiverId: event.spaWaiverId } : {}),
    // A blank SMART correlation ID is valid, but it should not erase an
    // identifier previously associated with an existing OneMAC package.
    ...(event.correlationId ? { correlationId: event.correlationId } : {}),
  };
};

const updateSmartIdentityFields = async (
  domain: string,
  index: ReturnType<typeof getDomainAndNamespace>["index"],
  documentId: string,
  event: SmartOnemacEvent,
  existing: ExistingSmartIdentity,
): Promise<Error | undefined> => {
  const updates = smartIdentityFields(event, existing);
  if (updates instanceof Error) return updates;

  if (Object.keys(updates).length > 0) {
    await os.updateItem(domain, index, documentId, updates);
  }

  return undefined;
};

export const persistSmartOnemacEvent = async (
  context: SmartOnemacEventContext,
): Promise<boolean> => {
  const { event, existence, topicPartition, kafkaKey, kafkaOffset, kafkaTimestamp } = context;
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
  if (existence.mainById) {
    const identityError = await updateSmartIdentityFields(
      domain,
      index,
      documentId,
      event,
      existence.mainById._source,
    );
    if (identityError) {
      await reportSmartValidationFailure(context, identityError);
      return false;
    }
    return true;
  }

  const document = transformMspManualRecordCreated(event);
  if (!document) {
    return false;
  }

  const createResult = await os.createItem(domain, index, document);
  if (!createResult.created) {
    // A concurrent writer claimed the package ID after the existence lookup.
    // Read its identity before applying any partial update so a race cannot
    // replace an established external identifier.
    const racedPackage = await os.getItem(domain, index, documentId);
    if (!racedPackage?._source) {
      throw new Error("package ID was claimed but could not be resolved after create conflict");
    }

    const identityError = await updateSmartIdentityFields(
      domain,
      index,
      documentId,
      event,
      racedPackage._source,
    );
    if (identityError) {
      await reportSmartValidationFailure(context, identityError);
      return false;
    }
  }

  return true;
};
