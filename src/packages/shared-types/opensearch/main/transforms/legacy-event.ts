import { onemacLegacySchema } from "../../..";

export const transform = (id: string) => {
  return onemacLegacySchema.transform((data) => {
    // Resolve the action type based on the GSI1pk
    const eventType = data.GSI1pk.split("OneMAC#submit")[1];
    switch (eventType) {
      case "waivernew":
      case "medicaidspa":
      case "chipspa":
      case "waiverappk":
      case "waiveramendment":
      case "waiverrenewal":
        return {
          id,
          submitterEmail: data.submitterEmail,
          submitterName: data.submitterName,
          origin: "OneMAC", // Marks this as having originated from *either* legacy or micro
          devOrigin: "legacy", // Not in use, but helpful for developers browsing OpenSearch
        };
      default:
        console.log(
          `Unhandled event type for ${id}:  ${eventType}.  Doing nothing and continuing.`
        );
        return undefined;
    }
  });
};

export type Schema = ReturnType<typeof transform>;
export const tombstone = (id: string) => {
  return {
    id,
    submitterEmail: null,
    submitterName: null,
  };
};
