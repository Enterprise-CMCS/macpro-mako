import { API } from "aws-amplify";

import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";

export type SaveDraftPayload = {
  id: string;
  event: string;
  authority?: string;
  draftData: Record<string, unknown>;
};

export const saveDraft = async (payload: SaveDraftPayload) => {
  try {
    return await API.post("os", "/saveDraft", { body: payload });
  } catch (error) {
    sendGAEvent("api_errror", {
      error: `failure /saveDraft ${payload.id}`,
    });
    throw error;
  }
};
