import { onemacLegacySchema, handleLegacyAttachment, Action } from "../../..";

export const transform = (id: string, offset: number) => {
  return onemacLegacySchema.transform((data) => {
    // Resolve the action type based on the GSI1pk
    const eventType = data.GSI1pk.split("OneMAC#")[1];
    const actionType = (() => {
      switch (eventType) {
        case "submitwaivernew":
        case "submitmedicaidspa":
        case "submitchipspa":
        case "submitwaiverappk":
        case "submitwaiveramendment":
        case "submitwaiverrenewal":
        case "submitwaiverextension":
        case "submitwaiverextensionb":
        case "submitwaiverextensionc":
          return "new-submission";
        case "submitmedicaidsparai":
        case "submitchipsparai":
        case "submitwaiverrai":
        case "submitwaiverappkrai":
          return Action.RESPOND_TO_RAI;
        case "submitrairesponsewithdraw":
          return Action.WITHDRAW_RAI;
        case "submitmedicaidspawithdraw":
        case "submitwaiveramendmentwithdraw":
        case "submitchipspawithdraw":
        case "submitwaiverappkwithdraw":
        case "submitwaivernewwithdraw":
        case "submitwaiverrenewalwithdraw":
          return Action.WITHDRAW_PACKAGE;
        default:
          console.log(
            `Unhandled event type for ${id}:  ${eventType}.  Doing nothing and continuing.`,
          );
          return undefined;
      }
    })();

    // Return if the actionType is unhandled
    if (actionType === undefined) return undefined;

    // If we're still here, go ahead and transform the data
    const transformedData = {
      id: `${data.componentId}-${offset}`, // Append only changelog, so we add the offset to make the document id unique
      packageId: id,
      timestamp: data.eventTimestamp,
      actionType,
      attachments: data.attachments?.map(handleLegacyAttachment) ?? null,
      additionalInformation: data.additionalInformation,
      submitterEmail: data.submitterEmail,
      submitterName: data.submitterName,
    };
    return transformedData;
  });
};

export type Schema = ReturnType<typeof transform>;
