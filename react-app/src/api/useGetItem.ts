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

const normalizeStatusCode = (value: unknown) => {
  const statusCode = typeof value === "string" ? Number(value) : value;
  return typeof statusCode === "number" && Number.isFinite(statusCode) ? statusCode : undefined;
};

const isNotFoundItemPayload = (value: unknown): boolean => {
  const candidate = value as {
    found?: boolean;
    message?: unknown;
    _source?: unknown;
    request?: {
      status?: number;
    };
    response?: {
      status?: number;
      statusCode?: number;
      statusText?: string;
      data?: unknown;
    };
    $metadata?: {
      httpStatusCode?: number;
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
  const responseStatus =
    candidate?.response?.status ??
    candidate?.response?.statusCode ??
    candidate?.request?.status ??
    candidate?.$metadata?.httpStatusCode;
  const directStatus = candidate?.status ?? candidate?.statusCode;
  const errorText = [
    candidate?.message,
    responseMessage,
    candidate?.response?.statusText,
    typeof value === "string" ? value : undefined,
  ].join(" ");

  return (
    candidate?.found === false ||
    includesNotFoundMessage(errorText) ||
    /status code 404/i.test(errorText) ||
    /\b404\b/i.test(errorText) ||
    /not found/i.test(errorText) ||
    normalizeStatusCode(responseStatus) === 404 ||
    normalizeStatusCode(directStatus) === 404
  );
};

export const getItem = async (
  id: string,
  options?: GetItemOptions,
): Promise<opensearch.main.ItemResult | undefined> => {
  const normalizedId = id?.trim().toUpperCase();
  if (!normalizedId) {
    return undefined;
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
      return undefined;
    }

    return response;
  } catch (error) {
    if (isNotFoundItemPayload(error)) {
      return undefined;
    }

    sendGAEvent("api_error", { message: `failure /item ${normalizedId}` });
    throw error;
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
  options?: UseQueryOptions<opensearch.main.ItemResult | undefined, ReactQueryApiError>,
  requestOptions?: GetItemOptions,
) => {
  return useQuery<opensearch.main.ItemResult | undefined, ReactQueryApiError>(
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
