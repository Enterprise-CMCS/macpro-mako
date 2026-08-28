import * as os from "libs/opensearch-lib";
import { getDomainAndNamespace } from "libs/utils";

import { getStateFromPackageId, transformMspManualRecordCreated } from "./mspManualRecordCreated";
import { SmartOnemacEvent } from "./parseSmartOnemacEvent";

type SmartReservationDocument = NonNullable<ReturnType<typeof transformMspManualRecordCreated>>;

const smartIdentityFields = (incomingEvent: SmartOnemacEvent) => ({
  spaWaiverId: incomingEvent.spaWaiverId,
  correlationId: incomingEvent.correlationId,
});

const overwriteSmartIdentityFields = async (
  domain: string,
  index: string,
  documentId: string,
  incomingEvent: SmartOnemacEvent,
): Promise<void> => {
  await os.updateItem(domain, index, documentId, smartIdentityFields(incomingEvent));
};

/**
 * Reserves a package ID in the main index so OneMAC cannot reuse it.
 *
 * The OpenSearch `_id` is the business `id`, so any existing document is a collision
 * regardless of its origin. Collisions always overwrite `spaWaiverId` and `correlationId`.
 * Status, origin, submitter, and every other existing field stay unchanged.
 */
export const reservePackageId = async (incomingEvent: SmartOnemacEvent): Promise<boolean> => {
  const documentId = incomingEvent.id.toUpperCase();
  if (!getStateFromPackageId(documentId)) {
    return false;
  }

  const { domain, index } = getDomainAndNamespace("main");
  const existingPackage = await os.getItem(domain, index, documentId);

  if (existingPackage) {
    await overwriteSmartIdentityFields(domain, index, documentId, incomingEvent);
    return true;
  }

  const document: SmartReservationDocument | undefined =
    transformMspManualRecordCreated(incomingEvent);
  if (!document) {
    return false;
  }

  const createResult = await os.createItem(domain, index, document);
  if (createResult.created) {
    return true;
  }

  await overwriteSmartIdentityFields(domain, index, documentId, incomingEvent);
  return true;
};
