import { API } from "aws-amplify";
import { SEATOOL_STATUS } from "shared-types";

import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";

type ItemExistsOptions = {
  includeDrafts?: boolean;
  allowDraftId?: string;
};

export const itemExists = async (id: string, options: ItemExistsOptions = {}): Promise<boolean> => {
  try {
    const draftIdFromUrl =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("draftId") ?? undefined
        : undefined;
    const allowDraftId = options.allowDraftId ?? draftIdFromUrl;
    const includeDrafts = options.includeDrafts ?? false;

    const response = await API.post("os", "/itemExists", {
      body: { id, includeDrafts },
    });

    if (
      includeDrafts &&
      allowDraftId &&
      allowDraftId.toUpperCase() === id.toUpperCase() &&
      response?.status === SEATOOL_STATUS.DRAFT
    ) {
      return false;
    }

    return response.exists;
  } catch (error) {
    sendGAEvent("api_errror", {
      error: `failure /itemExists ${id}`,
    });
    console.error("Error checking if item exists:", error);
    return false;
  }
};
