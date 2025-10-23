import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { opensearch, ReactQueryApiError, SEATOOL_STATUS } from "shared-types";

import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";

export const getItem = async (id: string): Promise<opensearch.main.ItemResult> =>
  await API.post("os", "/item", { body: { id } }).catch(() =>
    sendGAEvent("api_error", { message: `failure /item ${id}` }),
  );

export const idIsApproved = async (id: string) => {
  try {
    const record = await getItem(id);
    return record._source.seatoolStatus == SEATOOL_STATUS.APPROVED;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const canBeRenewedOrAmended = async (id: string) => {
  try {
    const record = await getItem(id);
    return ["New", "Renew"].includes(record._source.actionType);
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const useGetItem = (
  id: string,
  options?: UseQueryOptions<opensearch.main.ItemResult, ReactQueryApiError>,
) => {
  return useQuery<opensearch.main.ItemResult, ReactQueryApiError>(
    ["record", id],
    () => getItem(id),
    options,
  );
};
