import * as os from "libs/opensearch-lib";
import { getDomainAndNamespace } from "libs/utils";

import { SmartPackageExistence } from "./evaluateSmartPackageExistence";
import { getStateFromPackageId } from "./mspManualRecordCreated";
import { SmartOnemacEvent } from "./parseSmartOnemacEvent";
import { persistSmartOnemacEvent } from "./persistSmartOnemacEvent";

/**
 * Reserves a package ID in the main index so OneMAC cannot reuse it.
 *
 * The OpenSearch `_id` is the business `id`, so any existing document is a collision
 * regardless of its origin. An existing package may be associated with a missing
 * `spaWaiverId`, but an established external identifier is never replaced.
 */
export const reservePackageId = async (incomingEvent: SmartOnemacEvent): Promise<boolean> => {
  const documentId = incomingEvent.id.toUpperCase();
  if (!getStateFromPackageId(documentId)) {
    return false;
  }

  const { domain, index } = getDomainAndNamespace("main");
  const existingPackage = await os.getItem(domain, index, documentId);
  const existence: SmartPackageExistence = {
    mainById: existingPackage,
    mainBySpaWaiverId: undefined,
    changelogById: undefined,
  };

  return persistSmartOnemacEvent({
    event: incomingEvent,
    existence,
    topicPartition: "",
  });
};
