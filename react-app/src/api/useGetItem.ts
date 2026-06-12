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

const getErrorTextValue = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint" ||
    typeof value === "symbol"
  ) {
    return String(value);
  }

  if (value instanceof Error) {
    return `${value.name}: ${value.message}`;
  }

  if (value && typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return Object.prototype.toString.call(value);
    }
  }

  return "";
};

const collectErrorValues = (
  value: unknown,
  values: unknown[] = [],
  seen = new Set<unknown>(),
  depth = 0,
) => {
  if (value === null || value === undefined || depth > 4 || seen.has(value)) {
    return values;
  }

  seen.add(value);
  values.push(value);

  if (typeof value !== "object") {
    return values;
  }

  for (const key of Object.getOwnPropertyNames(value)) {
    try {
      collectErrorValues((value as Record<string, unknown>)[key], values, seen, depth + 1);
    } catch {
      // Some Error-like objects have getters that can throw.
    }
  }

  return values;
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

  if (candidate?.found === true && candidate?._source) {
    return false;
  }

  const responseStatus =
    candidate?.response?.status ??
    candidate?.response?.statusCode ??
    candidate?.request?.status ??
    candidate?.$metadata?.httpStatusCode;
  const directStatus = candidate?.status ?? candidate?.statusCode;
  const errorValues = collectErrorValues(value);
  const errorText = errorValues.map(getErrorTextValue).join(" ");

  return (
    candidate?.found === false ||
    includesNotFoundMessage(errorText) ||
    /status code 404/i.test(errorText) ||
    /\b404\b/i.test(errorText) ||
    /not found/i.test(errorText) ||
    normalizeStatusCode(responseStatus) === 404 ||
    normalizeStatusCode(directStatus) === 404 ||
    errorValues.some((errorValue) => normalizeStatusCode(errorValue) === 404)
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
    if (options?.includeDraft && options.preferDraft) {
      return undefined;
    }

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
