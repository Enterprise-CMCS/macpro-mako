import { legacyEventSchema, handleLegacyAttachment, Action } from "../../..";

export const transform = (id: string, offset: number) => {
  return legacyEventSchema.transform((data) => {
    // Resolve the action type based on the GSI1pk
    const eventType = data.GSI1pk.split("OneMAC#")[1];
    const actionType = (() => {
      switch (eventType) {
        // case "createchipspa":
        // case "createmedicaidspa":
        // case "createwaiveramendment":
        //   console.log(
        //     `NOSO event ${eventType} detected.  This event is not yet supported.  Doing nothing...`,
        //   );
        //   return undefined;
        case "enableRAIResponseWithdraw":
          return Action.ENABLE_RAI_WITHDRAW;
        case "submitchipspa":
        case "submitmedicaidspa":
        case "submitwaiveramendment":
        case "submitwaiverappk":
        case "submitwaiverextension":
        case "submitwaiverextensionb":
        case "submitwaiverextensionc":
        case "submitwaivernew":
        case "submitwaiverrenewal":
          return "new-submission";
        case "submitchipsparai":
        case "submitmedicaidsparai":
        case "submitwaiveramendmentrai":
        case "submitwaiverappkrai":
        case "submitwaiverrai":
          return Action.RESPOND_TO_RAI;
        case "submitchipspawithdraw":
        case "submitmedicaidspawithdraw":
        case "submitwaiveramendmentwithdraw":
        case "submitwaiverappkwithdraw":
        case "submitwaivernewwithdraw":
        case "submitwaiverrenewalwithdraw":
          return Action.WITHDRAW_PACKAGE;
        case "submitrairesponsewithdraw":
          return Action.WITHDRAW_RAI; // This should be a separate action thats just a request
        // case "withdrawchipspa":
        // case "withdrawmedicaidspa":
        // case "withdrawwaiveramendment":
        // case "withdrawwaiverappk":
        // case "withdrawwaivernew":
        // case "withdrawwaiverrenewal":
        //   console.log(
        //     `Deprecated action ${eventType} detected.  Doing nothing...`,
        //   );
        //   return undefined;
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
