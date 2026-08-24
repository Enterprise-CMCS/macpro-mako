import * as os from "libs/opensearch-lib";
import { getDomainAndNamespace } from "libs/utils";

import type { transformMspManualRecordCreated } from "./mspManualRecordCreated";
import { SmartOnemacEvent } from "./parseSmartOnemacEvent";

type SmartReservationDocument = NonNullable<ReturnType<typeof transformMspManualRecordCreated>>;

const getMissingSmartIdentityFields = (
  existingPackage: Awaited<ReturnType<typeof os.getItem>>,
  incomingEvent: SmartOnemacEvent,
): Partial<{ correlationId: string; spaWaiverId: string }> => {
  const existing = existingPackage?._source;
  const fields: Partial<{ correlationId: string; spaWaiverId: string }> = {};

  if (!existing?.correlationId) {
    fields.correlationId = incomingEvent.correlationId;
  }

  if (!existing?.spaWaiverId) {
    fields.spaWaiverId = incomingEvent.spaWaiverId;
  }

  return fields;
};

const mergeMissingSmartIdentityFields = async (
  domain: string,
  index: string,
  document: SmartReservationDocument,
  incomingEvent: SmartOnemacEvent,
  existingPackage: Awaited<ReturnType<typeof os.getItem>>,
): Promise<void> => {
  const missingFields = getMissingSmartIdentityFields(existingPackage, incomingEvent);

  if (Object.keys(missingFields).length === 0) {
    return;
  }

  await os.updateItem(domain, index, document.id, missingFields);
};

/**
 * Reserves a package ID in the main index so OneMAC cannot reuse it.
 *
 * The OpenSearch `_id` is the business `id`, so any existing document is a collision
 * regardless of its origin. Collisions add only missing `correlationId` and `spaWaiverId`
 * values. Status, origin, and every other existing field stay unchanged.
 */
export const reservePackageId = async (
  document: SmartReservationDocument,
  incomingEvent: SmartOnemacEvent,
): Promise<void> => {
  const { domain, index } = getDomainAndNamespace("main");
  const existingPackage = await os.getItem(domain, index, document.id);

  if (existingPackage) {
    await mergeMissingSmartIdentityFields(domain, index, document, incomingEvent, existingPackage);
    return;
  }

  const createResult = await os.createItem(domain, index, document);
  if (createResult.created) {
    return;
  }

  const racedPackage = await os.getItem(domain, index, document.id);
  await mergeMissingSmartIdentityFields(domain, index, document, incomingEvent, racedPackage);
};
