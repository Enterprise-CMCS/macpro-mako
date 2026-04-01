import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { opensearch, ReactQueryApiError, SEATOOL_STATUS } from "shared-types";

import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";

type GetItemOptions = {
  includeDraft?: boolean;
  preferDraft?: boolean;
};

const ITEM_NOT_FOUND_MESSAGE = "No record found for the given id";

const includesNotFoundMessage = (value: unknown) =>
  String(value ?? "").includes(ITEM_NOT_FOUND_MESSAGE);

const isNotFoundItemPayload = (value: unknown): boolean => {
  const candidate = value as {
    found?: boolean;
    message?: unknown;
    _source?: unknown;
    response?: {
      status?: number;
      statusCode?: number;
      data?: unknown;
    };
    status?: number;
    statusCode?: number;
  };

  const responseData = candidate?.response?.data;
  const responseMessage =
    typeof responseData === "string"
      ? responseData
      : typeof responseData === "object" && responseData && "message" in responseData
        ? (responseData as { message?: unknown }).message
        : undefined;
  const responseStatus = candidate?.response?.status ?? candidate?.response?.statusCode;
  const directStatus = candidate?.status ?? candidate?.statusCode;

  return (
    candidate?.found === false ||
    includesNotFoundMessage(candidate?.message) ||
    includesNotFoundMessage(responseMessage) ||
    responseStatus === 404 ||
    directStatus === 404
  );
};

export const getItem = async (
  id: string,
  options?: GetItemOptions,
): Promise<opensearch.main.ItemResult> => {
  const normalizedId = id?.trim().toUpperCase();
  if (!normalizedId) {
    return undefined as never;
  }

  try {
    const response = await API.post("os", "/item", {
      body: {
        id: normalizedId,
        includeDraft: options?.includeDraft,
        preferDraft: options?.preferDraft,
      },
    });

    if (isNotFoundItemPayload(response) || !(response as opensearch.main.ItemResult)?._source) {
      return undefined as never;
    }

    return response;
  } catch (error) {
    if (isNotFoundItemPayload(error)) {
      return undefined as never;
    }

    sendGAEvent("api_error", { message: `failure /item ${normalizedId}` });
    return undefined as never;
  }
};

export const idIsApproved = async (id: string) => {
  try {
    if (!id?.trim()) {
      return false;
    }

    const record = await getItem(id);
    return record?._source?.seatoolStatus == SEATOOL_STATUS.APPROVED;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const canBeRenewedOrAmended = async (id: string) => {
  try {
    if (!id?.trim()) {
      return false;
    }

    const record = await getItem(id);
    return ["New", "Renew"].includes(record?._source?.actionType ?? "");
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const useGetItem = (
  id: string,
  options?: UseQueryOptions<opensearch.main.ItemResult, ReactQueryApiError>,
  requestOptions?: GetItemOptions,
) => {
  return useQuery<opensearch.main.ItemResult, ReactQueryApiError>(
    [
      "record",
      id,
      requestOptions?.includeDraft
        ? requestOptions?.preferDraft
          ? "preferDraft"
          : "includeDraft"
        : "mainOnly",
    ],
    () => getItem(id, requestOptions),
    options,
  );
};
