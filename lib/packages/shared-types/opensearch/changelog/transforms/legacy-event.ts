import { getLegacyEventType } from "shared-utils";

import { handleLegacyAttachment, legacyEventSchema } from "../../..";
import { ONEMAC_LEGACY_ORIGIN } from "../../main/transforms/legacy-transforms";

export const transform = () => {
  return legacyEventSchema.transform((data) => {
    // Resolve the action type based on the GSI1pk
    const eventType = getLegacyEventType(data?.GSI1pk, data.waiverAuthority);

    // Return if the actionType is unhandled
    if (eventType === undefined) return undefined;

    // If we're still here, go ahead and transform the data
    const transformedData = {
      // Append only changelog, so we add the offset to make the document id unique
      // Legacy emits can emit multiple events for the same business event, so we key off the timestamp, not the offset, to prevent duplciates
      id: `${data.componentId}-legacy-${data.eventTimestamp ?? data.lastEventTimestamp}`,
      packageId: data.componentId,
      timestamp: data.eventTimestamp,
      event: eventType,
      attachments:
        data.attachments?.map((attachment) => handleLegacyAttachment(attachment)) ?? null,
      additionalInformation: data.additionalInformation,
      submitterEmail: data.submitterEmail,
      submitterName: data.submitterName,
      origin: ONEMAC_LEGACY_ORIGIN,
    };
    return transformedData;
  });
};

export type Schema = ReturnType<typeof transform>;
