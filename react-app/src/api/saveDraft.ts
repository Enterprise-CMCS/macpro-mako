import { API } from "aws-amplify";

import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";

export type SaveDraftPayload = {
  id: string;
  event: string;
  authority?: string;
  draftData: Record<string, unknown>;
  ifSeqNo?: number;
  ifPrimaryTerm?: number;
};

export type SaveDraftResponse = {
  message: string;
  id: string;
  seqNo?: number;
  primaryTerm?: number;
};

export const saveDraft = async (payload: SaveDraftPayload): Promise<SaveDraftResponse> => {
  try {
    return await API.post("os", "/saveDraft", { body: payload });
  } catch (error) {
    sendGAEvent("api_errror", {
      error: `failure /saveDraft ${payload.id}`,
    });
    throw error;
  }
};
